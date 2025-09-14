import axios from "axios";
import * as SecureStore from "expo-secure-store";

const base_url =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  gender: "male" | "female" | "";
  location: string;
  bloodGroup?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: string;
  lastVisit?: string;
  appointmentCount?: number;
}

export interface PatientFilters {
  search?: string;
  gender?: string;
  location?: string;
  limit?: number;
  offset?: number;
}

class PatientAPI {
  private async getAuthHeaders() {
    const token = await SecureStore.getItemAsync("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  async getDoctorPatients(filters: PatientFilters = {}) {
    try {
      const headers = await this.getAuthHeaders();

      // Get appointments for this doctor first to find patients
      const appointmentsResponse = await axios.get(
        `${base_url}/appointments?limit=1000`,
        { headers }
      );

      const appointments = appointmentsResponse.data.appointments || [];

      // Extract patients from appointments, using populated data when available
      const patientMap = new Map<string, any>();
      const patientIdsToFetch = new Set<string>();

      appointments.forEach((apt: any) => {
        // Skip appointments without patient data
        if (!apt.patient) return;

        let patientId: string | null = null;
        let patientData: any = null;

        // Handle populated patient object
        if (typeof apt.patient === "object" && apt.patient && apt.patient._id) {
          patientId = apt.patient._id;
          patientData = apt.patient; // Use already populated data
        }
        // Handle non-populated patient ID (string)
        else if (typeof apt.patient === "string") {
          patientId = apt.patient;
          if (patientId) {
            patientIdsToFetch.add(patientId); // Need to fetch this patient's data
          }
        }

        if (patientId) {
          if (patientData) {
            // Ensure the patient data has the required structure
            if (!patientData._id) {
              patientData._id = patientId;
            }
            patientMap.set(patientId, patientData);
          }
        }
      });

      const patientsFromPopulation = Array.from(patientMap.values());

      if (patientsFromPopulation.length === 0 && patientIdsToFetch.size === 0) {
        return { patients: [], total: 0 };
      }

      // Fetch additional patient details if needed
      let additionalPatients: any[] = [];
      if (patientIdsToFetch.size > 0) {
        const patientsData = await Promise.allSettled(
          Array.from(patientIdsToFetch).map(async (patientId: string) => {
            try {
              const patientResponse = await axios.get(
                `${base_url}/auth/user/${patientId}`,
                { headers }
              );
              return patientResponse.data.user;
            } catch (error) {
              console.error(`Error fetching patient ${patientId}:`, error);
              if (error instanceof Error) {
                console.error("Error details:", error.message);
              }
              return null;
            }
          }) as Promise<any>[]
        );

        additionalPatients = patientsData
          .filter(
            (result): result is PromiseFulfilledResult<any> =>
              result.status === "fulfilled" && result.value !== null
          )
          .map((result) => result.value);
      }

      // Combine all patients
      const allPatients = [...patientsFromPopulation, ...additionalPatients];

      // Add appointment statistics to each patient
      let patients = allPatients
        .filter((patient) => patient && patient._id) // Filter out null/invalid patients
        .map((patient) => {
          const patientId = patient._id;

          // Get patient appointments, handling both formats
          const patientAppointments = appointments.filter((apt: any) => {
            const aptPatientId =
              typeof apt.patient === "object" && apt.patient
                ? apt.patient._id
                : apt.patient;
            return aptPatientId === patientId;
          });

          const lastVisit = patientAppointments
            .filter((apt: any) => apt.status === "completed")
            .sort(
              (a: any, b: any) =>
                new Date(b.appointmentDate).getTime() -
                new Date(a.appointmentDate).getTime()
            )[0];

          return {
            ...patient,
            appointmentCount: patientAppointments.length,
            lastVisit: lastVisit?.appointmentDate || null,
          };
        });

      // Apply filters
      if (filters.search) {
        const search = filters.search.toLowerCase();
        patients = patients.filter(
          (p) =>
            p.firstName?.toLowerCase().includes(search) ||
            p.lastName?.toLowerCase().includes(search) ||
            p.email?.toLowerCase().includes(search)
        );
      }

      if (filters.gender) {
        patients = patients.filter((p) => p.gender === filters.gender);
      }

      if (filters.location) {
        patients = patients.filter(
          (p) =>
            p.location &&
            filters.location &&
            p.location.toLowerCase().includes(filters.location.toLowerCase())
        );
      }

      // Apply pagination
      const offset = filters.offset || 0;
      const limit = filters.limit || 20;
      const paginatedPatients = patients.slice(offset, offset + limit);

      return {
        patients: paginatedPatients,
        total: patients.length,
      };
    } catch (error: any) {
      console.error("Get doctor patients error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch patients"
      );
    }
  }

  async getPatientDetails(patientId: string) {
    try {
      console.log("getPatientDetails called with ID:", patientId);
      const headers = await this.getAuthHeaders();

      // Get patient basic info
      console.log("Making request to:", `${base_url}/auth/user/${patientId}`);
      const patientResponse = await axios.get(
        `${base_url}/auth/user/${patientId}`,
        { headers }
      );

      // Get patient appointments with this doctor
      const appointmentsResponse = await axios.get(
        `${base_url}/appointments?limit=100`,
        { headers }
      );

      // Filter appointments for this patient, handling both object and string patient formats
      const appointments =
        appointmentsResponse.data.appointments?.filter((apt: any) => {
          if (!apt.patient) return false; // Skip appointments without patient data
          const aptPatientId =
            typeof apt.patient === "object" && apt.patient
              ? apt.patient._id
              : apt.patient;
          return aptPatientId === patientId;
        }) || [];

      // Calculate stats
      const completedAppointments = appointments.filter(
        (apt: any) => apt.status === "completed"
      );
      const pendingAppointments = appointments.filter(
        (apt: any) => apt.status === "pending" || apt.status === "confirmed"
      );

      const lastVisitAppointment = completedAppointments.sort(
        (a: any, b: any) =>
          new Date(b.appointmentDate).getTime() -
          new Date(a.appointmentDate).getTime()
      )[0];

      return {
        patient: patientResponse.data.user,
        appointments,
        stats: {
          totalAppointments: appointments.length,
          completedAppointments: completedAppointments.length,
          pendingAppointments: pendingAppointments.length,
          lastVisit: lastVisitAppointment?.appointmentDate || null,
        },
      };
    } catch (error: any) {
      console.error("Get patient details error:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch patient details"
      );
    }
  }
}

export const patientAPI = new PatientAPI();
