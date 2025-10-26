import { Button } from "@/components/Button";
import colors from "@/constants/colors";
import type { Hospital } from "@/constants/hospitals";
import { useApp } from "@/contexts/AppContext";
import { hospitalApi } from "@/lib/api";
import { useRouter } from "expo-router";
import { Calendar, ChevronDown, Clock, MapPin, X } from "lucide-react-native";
import { useState, useEffect, type ReactNode } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

export default function GoLiveScreen() {
  const { goLive } = useApp();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedHospital, setSelectedHospital] = useState<string>("");
  const [hospitalSearch, setHospitalSearch] = useState("");
  const [showHospitalPicker, setShowHospitalPicker] = useState(false);
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [fromTime, setFromTime] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [toTime, setToTime] = useState<Date>(new Date());
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);

  useEffect(() => {
    const loadHospitals = async () => {
      try {
        const data = await hospitalApi.getAll();
        setHospitals(data);
      } catch (error) {
        console.error("Failed to load hospitals:", error);
      }
    };
    loadHospitals();
  }, []);

  const filteredHospitals = hospitals.filter((hospital) =>
    hospital.name.toLowerCase().includes(hospitalSearch.toLowerCase())
  );

  const selectedHospitalData = hospitals.find((h) => h.id === selectedHospital);

  const handleSelectHospital = (hospitalId: string) => {
    setSelectedHospital(hospitalId);
    setShowHospitalPicker(false);
    setHospitalSearch("");
  };

  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatTime = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const onFromDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowFromDatePicker(false);
    }
    if (selectedDate) {
      setFromDate(selectedDate);
    }
  };

  const onFromTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowFromTimePicker(false);
    }
    if (selectedDate) {
      setFromTime(selectedDate);
    }
  };

  const onToDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowToDatePicker(false);
    }
    if (selectedDate) {
      setToDate(selectedDate);
    }
  };

  const onToTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowToTimePicker(false);
    }
    if (selectedDate) {
      setToTime(selectedDate);
    }
  };

  const handleStartReceiving = async () => {
    const selectedHospitalData = hospitals.find((h) => h.id === selectedHospital);
    if (!selectedHospitalData) return;

    await goLive({
      hospitalId: selectedHospital,
      hospitalName: selectedHospitalData.name,
      fromDate: formatDate(fromDate),
      fromTime: formatTime(fromTime),
      toDate: formatDate(toDate),
      toTime: formatTime(toTime),
      startedAt: new Date().toISOString(),
    });

    console.log("Starting to receive requests", {
      hospital: selectedHospital,
      from: `${formatDate(fromDate)} ${formatTime(fromTime)}`,
      to: `${formatDate(toDate)} ${formatTime(toTime)}`,
    });
    router.back();
  };

  const isFormValid = selectedHospital;

  const renderDateTimePicker = (
    mode: 'date' | 'time',
    value: Date,
    onChange: (event: DateTimePickerEvent, date?: Date) => void,
    show: boolean,
    setShow: (show: boolean) => void,
    placeholder: string,
    icon?: ReactNode
  ) => {
    if (Platform.OS === 'web') {
      return (
        <View style={styles.dateTimeInput}>
          {icon && <View style={styles.inputIcon}>{icon}</View>}
          <input
            type={mode}
            value={mode === 'date' ? value.toISOString().split('T')[0] : `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`}
            onChange={(e) => {
              if (mode === 'date') {
                const newDate = new Date(e.target.value);
                if (!isNaN(newDate.getTime())) {
                  onChange({ type: 'set', nativeEvent: {} } as DateTimePickerEvent, newDate);
                }
              } else {
                const [hours, minutes] = e.target.value.split(':');
                const newTime = new Date(value);
                newTime.setHours(parseInt(hours), parseInt(minutes));
                onChange({ type: 'set', nativeEvent: {} } as DateTimePickerEvent, newTime);
              }
            }}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: 16,
              color: colors.text.primary,
              fontFamily: 'inherit',
            }}
          />
        </View>
      );
    }

    return (
      <>
        <Pressable
          style={styles.dateTimeInput}
          onPress={() => setShow(true)}
        >
          {icon && <View style={styles.inputIcon}>{icon}</View>}
          <Text style={styles.dateTimeText}>
            {mode === 'date' ? formatDate(value) : formatTime(value)}
          </Text>
        </Pressable>
        {show && (
          <DateTimePicker
            value={value}
            mode={mode}
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onChange}
          />
        )}
      </>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <X size={24} color={colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Go Live</Text>
        <Text style={styles.subtitle}>
          Start accepting patient requests at your selected hospital
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>What hospital will you be at?</Text>
          <Pressable
            style={styles.selectButton}
            onPress={() => setShowHospitalPicker(true)}
          >
            {selectedHospitalData ? (
              <View style={styles.selectedHospital}>
                <View style={styles.hospitalIcon}>
                  <MapPin size={20} color={colors.primary} />
                </View>
                <View style={styles.hospitalInfo}>
                  <Text style={styles.hospitalName}>
                    {selectedHospitalData.name}
                  </Text>
                  <Text style={styles.hospitalLocation}>
                    {selectedHospitalData.location}
                  </Text>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.selectIcon}>
                  <MapPin size={20} color={colors.text.secondary} />
                </View>
                <Text style={styles.selectPlaceholder}>Select hospital</Text>
              </>
            )}
            <ChevronDown size={20} color={colors.text.secondary} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>From</Text>
          <View style={styles.dateTimeRow}>
            {renderDateTimePicker(
              'date',
              fromDate,
              onFromDateChange,
              showFromDatePicker,
              setShowFromDatePicker,
              'DD/MM/YYYY',
              <Calendar size={18} color={colors.text.secondary} />
            )}
            {renderDateTimePicker(
              'time',
              fromTime,
              onFromTimeChange,
              showFromTimePicker,
              setShowFromTimePicker,
              'HH:MM',
              <Clock size={18} color={colors.text.secondary} />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>To</Text>
          <View style={styles.dateTimeRow}>
            {renderDateTimePicker(
              'date',
              toDate,
              onToDateChange,
              showToDatePicker,
              setShowToDatePicker,
              'DD/MM/YYYY',
              <Calendar size={18} color={colors.text.secondary} />
            )}
            {renderDateTimePicker(
              'time',
              toTime,
              onToTimeChange,
              showToTimePicker,
              setShowToTimePicker,
              'HH:MM',
              <Clock size={18} color={colors.text.secondary} />
            )}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Once you go live, patients at the selected hospital will be able to
            see your availability and request your assistance.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom || 24 }]}>
        <Button
          title="Start Receiving Requests"
          onPress={handleStartReceiving}
          disabled={!isFormValid}
        />
      </View>

      <Modal visible={showHospitalPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Hospital</Text>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => {
                  setShowHospitalPicker(false);
                  setHospitalSearch("");
                }}
              >
                <X size={24} color={colors.text.primary} />
              </Pressable>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={hospitalSearch}
                onChangeText={setHospitalSearch}
                placeholder="Search hospitals..."
                placeholderTextColor={colors.text.light}
                autoFocus
              />
            </View>

            <ScrollView style={styles.hospitalList}>
              {filteredHospitals.map((hospital) => (
                <Pressable
                  key={hospital.id}
                  style={[
                    styles.hospitalItem,
                    selectedHospital === hospital.id &&
                      styles.hospitalItemSelected,
                  ]}
                  onPress={() => handleSelectHospital(hospital.id)}
                >
                  <View style={styles.hospitalItemIcon}>
                    <MapPin size={20} color={colors.primary} />
                  </View>
                  <View style={styles.hospitalItemContent}>
                    <Text style={styles.hospitalItemName}>{hospital.name}</Text>
                    <Text style={styles.hospitalItemLocation}>
                      {hospital.location}
                    </Text>
                  </View>
                </Pressable>
              ))}
              {filteredHospitals.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No hospitals found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.cream,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginBottom: 12,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    minHeight: 60,
  },
  selectIcon: {
    marginRight: 12,
  },
  selectPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: colors.text.light,
  },
  selectedHospital: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  hospitalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card.lavender,
    alignItems: "center",
    justifyContent: "center",
  },
  hospitalInfo: {
    flex: 1,
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginBottom: 2,
  },
  hospitalLocation: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateTimeInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderRadius: 16,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  dateTimeText: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  infoCard: {
    backgroundColor: colors.card.mint,
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingTop: 16,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: colors.text.primary,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.medium,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text.primary,
  },
  hospitalList: {
    maxHeight: 500,
  },
  hospitalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    gap: 12,
  },
  hospitalItemSelected: {
    backgroundColor: colors.card.mint,
  },
  hospitalItemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card.lavender,
    alignItems: "center",
    justifyContent: "center",
  },
  hospitalItemContent: {
    flex: 1,
  },
  hospitalItemName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.primary,
    marginBottom: 4,
  },
  hospitalItemLocation: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: colors.text.secondary,
  },
});
