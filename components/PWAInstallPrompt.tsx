import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { X, Download } from 'lucide-react-native';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handler = (e: Event) => {
      e.preventDefault();
      console.log('💾 PWA install prompt captured');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      console.log('✅ App is already installed');
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  useEffect(() => {
    if (showPrompt) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showPrompt, slideAnim]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.log('❌ No install prompt available');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      console.log('📱 User install choice:', choiceResult.outcome);
      
      if (choiceResult.outcome === 'accepted') {
        console.log('✅ User accepted the install prompt');
      } else {
        console.log('❌ User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('❌ Error showing install prompt:', error);
    }
  };

  const handleDismiss = () => {
    console.log('⏸️ Install prompt dismissed, will show again in 10 seconds');
    setShowPrompt(false);
    
    setTimeout(() => {
      if (deferredPrompt) {
        console.log('🔄 Re-showing install prompt');
        setShowPrompt(true);
      }
    }, 10000);
  };

  if (Platform.OS !== 'web' || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Download size={20} color="#1A1A1A" />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Install Health Concierge</Text>
          <Text style={styles.subtitle}>Add to your home screen for quick access</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.installButton} 
            onPress={handleInstall}
          >
            <Text style={styles.installButtonText}>Install</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.dismissButton} 
            onPress={handleDismiss}
          >
            <X size={20} color="#666666" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute' as 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#1A1A1A',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  installButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  installButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  dismissButton: {
    padding: 8,
  },
});
