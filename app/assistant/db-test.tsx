import { Button } from "@/components/Button";
import colors from "@/constants/colors";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { assistantApi, patientApi, sessionApi, liveSessionApi, hospitalApi } from "@/lib/api";
import { Check, X } from "lucide-react-native";

type TestResult = {
  name: string;
  status: "success" | "error" | "pending";
  message?: string;
};

export default function DatabaseTestScreen() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const addResult = (result: TestResult) => {
    setResults((prev) => [...prev, result]);
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      await testHospitals();
      await testAssistants();
      await testPatients();
      await testSessions();
      await testLiveSessions();
      
      Alert.alert("Tests Complete", "All database tests have been executed. Check results above.");
    } catch (error) {
      console.error("Test execution failed:", error);
      Alert.alert("Error", "Test execution failed. Check console for details.");
    } finally {
      setIsRunning(false);
    }
  };

  const testHospitals = async () => {
    try {
      addResult({ name: "Hospitals - Read All", status: "pending" });
      const hospitals = await hospitalApi.getAll();
      if (hospitals && hospitals.length > 0) {
        addResult({
          name: "Hospitals - Read All",
          status: "success",
          message: `Found ${hospitals.length} hospitals`,
        });

        const testHospitalId = hospitals[0].id;
        addResult({ name: "Hospitals - Read By ID", status: "pending" });
        const hospital = await hospitalApi.getById(testHospitalId);
        if (hospital && hospital.id === testHospitalId) {
          addResult({
            name: "Hospitals - Read By ID",
            status: "success",
            message: `Found hospital: ${hospital.name}`,
          });
        } else {
          addResult({
            name: "Hospitals - Read By ID",
            status: "error",
            message: "Failed to retrieve hospital by ID",
          });
        }
      } else {
        addResult({
          name: "Hospitals - Read All",
          status: "error",
          message: "No hospitals found. Run seed data first.",
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addResult({
        name: "Hospitals - Test",
        status: "error",
        message: errorMessage,
      });
    }
  };

  const testAssistants = async () => {
    let createdAssistantId: string | null = null;

    try {
      addResult({ name: "Assistants - Create", status: "pending" });
      const newAssistant = await assistantApi.create({
        name: "Test Assistant",
        email: `test.assistant.${Date.now()}@example.com`,
        phone: "+233123456789",
        address: "Test Address, Accra",
        photo: "https://via.placeholder.com/150",
        role: "Nurse",
        idPhoto: "https://via.placeholder.com/150",
        otherDetails: "Test details",
        services: ["General Care", "Emergency"],
        pricingModel: "hourly",
        rate: 50,
        verificationStatus: "pending",
      });

      if (newAssistant && newAssistant.id) {
        createdAssistantId = newAssistant.id;
        addResult({
          name: "Assistants - Create",
          status: "success",
          message: `Created assistant: ${newAssistant.name}`,
        });

        addResult({ name: "Assistants - Read By ID", status: "pending" });
        const fetchedAssistant = await assistantApi.getById(createdAssistantId);
        if (fetchedAssistant && fetchedAssistant.id === createdAssistantId) {
          addResult({
            name: "Assistants - Read By ID",
            status: "success",
            message: `Found assistant: ${fetchedAssistant.name}`,
          });
        } else {
          addResult({
            name: "Assistants - Read By ID",
            status: "error",
            message: "Failed to retrieve assistant by ID",
          });
        }

        addResult({ name: "Assistants - Update", status: "pending" });
        const updatedAssistant = await assistantApi.update(createdAssistantId, {
          name: "Updated Test Assistant",
          phone: "+233987654321",
        });
        if (updatedAssistant && updatedAssistant.name === "Updated Test Assistant") {
          addResult({
            name: "Assistants - Update",
            status: "success",
            message: "Successfully updated assistant",
          });
        } else {
          addResult({
            name: "Assistants - Update",
            status: "error",
            message: "Failed to update assistant",
          });
        }

        addResult({ name: "Assistants - Read All", status: "pending" });
        const allAssistants = await assistantApi.getAll();
        if (allAssistants && allAssistants.length > 0) {
          addResult({
            name: "Assistants - Read All",
            status: "success",
            message: `Found ${allAssistants.length} assistants`,
          });
        } else {
          addResult({
            name: "Assistants - Read All",
            status: "error",
            message: "Failed to retrieve all assistants",
          });
        }
      } else {
        addResult({
          name: "Assistants - Create",
          status: "error",
          message: "Failed to create assistant",
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addResult({
        name: "Assistants - Test",
        status: "error",
        message: errorMessage,
      });
    }
  };

  const testPatients = async () => {
    let createdPatientId: string | null = null;

    try {
      addResult({ name: "Patients - Create", status: "pending" });
      const newPatient = await patientApi.create({
        name: "Test Patient",
        contact: "+233123456789",
        location: "Test Location, Accra",
        isPatient: true,
        hasInsurance: true,
        insuranceProvider: "Test Insurance Co.",
        insuranceNumber: "INS123456",
        hasCard: true,
        cardPhoto: "https://via.placeholder.com/150",
        cardDetails: "Test card details",
        idPhoto: "https://via.placeholder.com/150",
      });

      if (newPatient && newPatient.id) {
        createdPatientId = newPatient.id;
        addResult({
          name: "Patients - Create",
          status: "success",
          message: `Created patient: ${newPatient.name}`,
        });

        addResult({ name: "Patients - Read By ID", status: "pending" });
        const fetchedPatient = await patientApi.getById(createdPatientId);
        if (fetchedPatient && fetchedPatient.id === createdPatientId) {
          addResult({
            name: "Patients - Read By ID",
            status: "success",
            message: `Found patient: ${fetchedPatient.name}`,
          });
        } else {
          addResult({
            name: "Patients - Read By ID",
            status: "error",
            message: "Failed to retrieve patient by ID",
          });
        }

        addResult({ name: "Patients - Update", status: "pending" });
        const updatedPatient = await patientApi.update(createdPatientId, {
          name: "Updated Test Patient",
          contact: "+233987654321",
        });
        if (updatedPatient && updatedPatient.name === "Updated Test Patient") {
          addResult({
            name: "Patients - Update",
            status: "success",
            message: "Successfully updated patient",
          });
        } else {
          addResult({
            name: "Patients - Update",
            status: "error",
            message: "Failed to update patient",
          });
        }
      } else {
        addResult({
          name: "Patients - Create",
          status: "error",
          message: "Failed to create patient",
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addResult({
        name: "Patients - Test",
        status: "error",
        message: errorMessage,
      });
    }
  };

  const testSessions = async () => {
    try {
      const hospitals = await hospitalApi.getAll();
      const patients = await patientApi.create({
        name: "Session Test Patient",
        contact: "+233111222333",
        location: "Test Location",
        isPatient: true,
        hasInsurance: false,
        hasCard: false,
      });

      if (!hospitals || hospitals.length === 0) {
        addResult({
          name: "Sessions - Test",
          status: "error",
          message: "No hospitals found for session test",
        });
        return;
      }

      const testHospital = hospitals[0];
      let createdSessionId: string | null = null;

      addResult({ name: "Sessions - Create", status: "pending" });
      const newSession = await sessionApi.create({
        patientId: patients.id,
        patientName: patients.name,
        patientGender: "Male",
        patientAgeRange: "30-40",
        hospitalId: testHospital.id,
        hospitalName: testHospital.name,
        status: "pending",
        requesterName: patients.name,
        isRequesterPatient: true,
        estimatedArrival: new Date(Date.now() + 3600000).toISOString(),
        hasInsurance: false,
        hasCard: false,
      });

      if (newSession && newSession.id) {
        createdSessionId = newSession.id;
        addResult({
          name: "Sessions - Create",
          status: "success",
          message: `Created session for patient: ${newSession.patientName}`,
        });

        addResult({ name: "Sessions - Read By ID", status: "pending" });
        const fetchedSession = await sessionApi.getById(createdSessionId);
        if (fetchedSession && fetchedSession.id === createdSessionId) {
          addResult({
            name: "Sessions - Read By ID",
            status: "success",
            message: `Found session: ${fetchedSession.id}`,
          });
        } else {
          addResult({
            name: "Sessions - Read By ID",
            status: "error",
            message: "Failed to retrieve session by ID",
          });
        }

        addResult({ name: "Sessions - Update", status: "pending" });
        const updatedSession = await sessionApi.update(createdSessionId, {
          status: "accepted",
          acceptedAt: new Date().toISOString(),
        });
        if (updatedSession && updatedSession.status === "accepted") {
          addResult({
            name: "Sessions - Update",
            status: "success",
            message: "Successfully updated session status",
          });
        } else {
          addResult({
            name: "Sessions - Update",
            status: "error",
            message: "Failed to update session",
          });
        }

        addResult({ name: "Sessions - Read All", status: "pending" });
        const allSessions = await sessionApi.getAll();
        if (allSessions && allSessions.length > 0) {
          addResult({
            name: "Sessions - Read All",
            status: "success",
            message: `Found ${allSessions.length} sessions`,
          });
        } else {
          addResult({
            name: "Sessions - Read All",
            status: "error",
            message: "Failed to retrieve all sessions",
          });
        }

        addResult({ name: "Sessions - Read By Status", status: "pending" });
        const pendingSessions = await sessionApi.getByStatus("pending");
        addResult({
          name: "Sessions - Read By Status",
          status: "success",
          message: `Found ${pendingSessions.length} pending sessions`,
        });

        addResult({ name: "Sessions - Read Open Requests", status: "pending" });
        const openRequests = await sessionApi.getOpenRequests();
        addResult({
          name: "Sessions - Read Open Requests",
          status: "success",
          message: `Found ${openRequests.length} open requests`,
        });
      } else {
        addResult({
          name: "Sessions - Create",
          status: "error",
          message: "Failed to create session",
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addResult({
        name: "Sessions - Test",
        status: "error",
        message: errorMessage,
      });
    }
  };

  const testLiveSessions = async () => {
    try {
      const hospitals = await hospitalApi.getAll();
      const assistant = await assistantApi.create({
        name: "Live Session Test Assistant",
        email: `live.test.${Date.now()}@example.com`,
        phone: "+233444555666",
        address: "Test Address",
        photo: "https://via.placeholder.com/150",
        role: "Doctor",
        idPhoto: "https://via.placeholder.com/150",
        otherDetails: "",
        services: ["General Care"],
        pricingModel: "fixed",
        rate: 100,
        verificationStatus: "verified",
      });

      if (!hospitals || hospitals.length === 0) {
        addResult({
          name: "Live Sessions - Test",
          status: "error",
          message: "No hospitals found for live session test",
        });
        return;
      }

      const testHospital = hospitals[0];

      addResult({ name: "Live Sessions - Create", status: "pending" });
      const liveSession = await liveSessionApi.create(assistant.id, {
        hospitalId: testHospital.id,
        hospitalName: testHospital.name,
        fromDate: new Date().toISOString().split("T")[0],
        fromTime: "08:00",
        toDate: new Date().toISOString().split("T")[0],
        toTime: "16:00",
      });

      if (liveSession) {
        addResult({
          name: "Live Sessions - Create",
          status: "success",
          message: `Created live session at ${liveSession.hospitalName}`,
        });

        addResult({ name: "Live Sessions - Get Active", status: "pending" });
        const activeSession = await liveSessionApi.getActive(assistant.id);
        if (activeSession) {
          addResult({
            name: "Live Sessions - Get Active",
            status: "success",
            message: `Found active session at ${activeSession.hospitalName}`,
          });

          addResult({ name: "Live Sessions - End", status: "pending" });
          const endedSession = await liveSessionApi.end(assistant.id, "Test completed");
          if (endedSession) {
            addResult({
              name: "Live Sessions - End",
              status: "success",
              message: "Successfully ended live session",
            });
          } else {
            addResult({
              name: "Live Sessions - End",
              status: "error",
              message: "Failed to end live session",
            });
          }
        } else {
          addResult({
            name: "Live Sessions - Get Active",
            status: "error",
            message: "Failed to retrieve active session",
          });
        }
      } else {
        addResult({
          name: "Live Sessions - Create",
          status: "error",
          message: "Failed to create live session",
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      addResult({
        name: "Live Sessions - Test",
        status: "error",
        message: errorMessage,
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Database Connection Test</Text>
        <Text style={styles.description}>
          This page performs CRUD operations on all database tables to verify connectivity and functionality.
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title={isRunning ? "Running Tests..." : "Run All Tests"}
            onPress={runTests}
            disabled={isRunning}
          />
        </View>

        {isRunning && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Running tests...</Text>
          </View>
        )}

        {results.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Test Results</Text>
            {results.map((result, index) => (
              <View
                key={index}
                style={[
                  styles.resultItem,
                  result.status === "success" && styles.resultSuccess,
                  result.status === "error" && styles.resultError,
                  result.status === "pending" && styles.resultPending,
                ]}
              >
                <View style={styles.resultHeader}>
                  {result.status === "success" && (
                    <Check size={20} color={colors.success} />
                  )}
                  {result.status === "error" && (
                    <X size={20} color={colors.error} />
                  )}
                  {result.status === "pending" && (
                    <ActivityIndicator size="small" color={colors.warning} />
                  )}
                  <Text
                    style={[
                      styles.resultName,
                      result.status === "success" && styles.resultNameSuccess,
                      result.status === "error" && styles.resultNameError,
                    ]}
                  >
                    {result.name}
                  </Text>
                </View>
                {result.message && (
                  <Text style={styles.resultMessage}>{result.message}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonContainer: {
    marginBottom: 32,
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 12,
  },
  resultsContainer: {
    marginTop: 24,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.text.primary,
    marginBottom: 16,
  },
  resultItem: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  resultSuccess: {
    borderColor: colors.success + "40",
    backgroundColor: colors.success + "08",
  },
  resultError: {
    borderColor: colors.error + "40",
    backgroundColor: colors.error + "08",
  },
  resultPending: {
    borderColor: colors.warning + "40",
    backgroundColor: colors.warning + "08",
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text.primary,
    flex: 1,
  },
  resultNameSuccess: {
    color: colors.success,
  },
  resultNameError: {
    color: colors.error,
  },
  resultMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 32,
  },
});
