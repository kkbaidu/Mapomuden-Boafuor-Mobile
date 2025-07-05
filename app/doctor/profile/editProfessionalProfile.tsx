import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface ISpecialization {
  name: string;
  certification?: string;
  yearsOfExperience: number;
}

interface IAvailability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface IConsultationFee {
  inPerson: number;
  videoCall: number;
  phoneCall: number;
  currency: string;
}

interface IEducation {
  degree: string;
  institution: string;
  year: number;
}

interface ICertification {
  name: string;
  institution: string;
  year: number;
  expiryDate?: string;
}

interface IDoctorProfile {
  licenseNumber: string;
  specializations: ISpecialization[];
  hospital?: string;
  clinic?: string;
  address?: string;
  consultationFees: IConsultationFee;
  availability: IAvailability[];
  languages: string[];
  bio?: string;
  experience: number;
  education: IEducation[];
  certifications: ICertification[];
  isActive: boolean;
}

const base_url = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api';

const DoctorProfileForm: React.FC = () => {
  const { token } = useAuthContext();
  const [activeSection, setActiveSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<IDoctorProfile>({
    licenseNumber: '',
    specializations: [{ name: '', certification: '', yearsOfExperience: 0 }],
    hospital: '',
    clinic: '',
    address: '',
    consultationFees: {
      inPerson: 0,
      videoCall: 0,
      phoneCall: 0,
      currency: 'USD',
    },
    availability: Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      startTime: '09:00',
      endTime: '17:00',
      isAvailable: i < 5, // Monday to Friday default
    })),
    languages: [''],
    bio: '',
    experience: 0,
    education: [{ degree: '', institution: '', year: new Date().getFullYear() }],
    certifications: [{ name: '', institution: '', year: new Date().getFullYear() }],
    isActive: true,
  });

  const insets = useSafeAreaInsets();

  const sections = [
    { title: 'Basic Info', icon: 'person-outline' },
    { title: 'Specializations', icon: 'medical-outline' },
    { title: 'Consultation Fees', icon: 'card-outline' },
    { title: 'Availability', icon: 'calendar-outline' },
    { title: 'Education', icon: 'school-outline' },
    { title: 'Certifications', icon: 'ribbon-outline' },
  ];

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // API Functions
  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${base_url}/doctors/profile/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        // New doctor - no profile exists yet, keep default form values
        console.log('New doctor detected - no profile found');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.doctorProfile) {
        // Transform the API response to match our form structure
        const apiProfile = data.doctorProfile;
        setProfile({
          licenseNumber: apiProfile.licenseNumber || '',
          specializations: apiProfile.specializations?.length > 0 
            ? apiProfile.specializations 
            : [{ name: '', certification: '', yearsOfExperience: 0 }],
          hospital: apiProfile.hospital || '',
          clinic: apiProfile.clinic || '',
          address: apiProfile.address || '',
          consultationFees: apiProfile.consultationFees || {
            inPerson: 0,
            videoCall: 0,
            phoneCall: 0,
            currency: 'USD',
          },
          availability: apiProfile.availability?.length > 0 
            ? apiProfile.availability 
            : Array.from({ length: 7 }, (_, i) => ({
                dayOfWeek: i,
                startTime: '09:00',
                endTime: '17:00',
                isAvailable: i < 5,
              })),
          languages: apiProfile.languages?.length > 0 ? apiProfile.languages : [''],
          bio: apiProfile.bio || '',
          experience: apiProfile.experience || 0,
          education: apiProfile.education?.length > 0 
            ? apiProfile.education 
            : [{ degree: '', institution: '', year: new Date().getFullYear() }],
          certifications: apiProfile.certifications?.length > 0 
            ? apiProfile.certifications.map((cert: any) => ({
                ...cert,
                expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : '',
              }))
            : [{ name: '', institution: '', year: new Date().getFullYear() }],
          isActive: apiProfile.isActive !== undefined ? apiProfile.isActive : true,
        });
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      // Don't show error for 404 - it's expected for new doctors
      if (error instanceof Error && !error.message.includes('404')) {
        Alert.alert(
          'Error',
          'Failed to load your profile. Please check your connection and try again.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const saveDoctorProfile = async () => {
    try {
      setSaving(true);
      
      // Validate required fields
      if (!profile.licenseNumber.trim()) {
        Alert.alert('Validation Error', 'License number is required');
        return;
      }

      if (profile.experience <= 0) {
        Alert.alert('Validation Error', 'Years of experience must be greater than 0');
        return;
      }

      // Transform form data for API
      const profileData = {
        ...profile,
        certifications: profile.certifications.map(cert => ({
          ...cert,
          expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : undefined,
        })),
        languages: profile.languages.filter((lang: any) => {
          if(typeof lang === "string") {
            return lang.trim() !== '';
          }
          return lang[""].trim() !== '';
        }).map((lang: any) => {
          if(typeof lang === "string") {
            return lang.trim();
          }
          return lang[""].trim();
      }),
      };

      const response = await fetch(`${base_url}/doctors/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      Alert.alert(
        'Success',
        'Your profile has been updated successfully!',
        [{ text: 'OK' }]
      );

      // Optionally refresh the profile data
      await fetchDoctorProfile();
      
    } catch (error) {
      console.error('Error saving doctor profile:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to update profile. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
  };

  // Load profile data on component mount
  useEffect(() => {
    if (token) {
      fetchDoctorProfile();
    }
  }, [token]);

  const updateProfile = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (field: keyof IDoctorProfile, index: number, subField: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).map((item: any, i: number) =>
        i === index ? { ...item, [subField]: value } : item
      ),
    }));
  };

  const addArrayItem = (field: keyof IDoctorProfile, defaultItem: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: [...(prev[field] as any[]), defaultItem],
    }));
  };

  const removeArrayItem = (field: keyof IDoctorProfile, index: number) => {
    setProfile(prev => ({
      ...prev,
      [field]: (prev[field] as any[]).filter((_: any, i: number) => i !== index),
    }));
  };

  const handleSubmit = () => {
    saveDoctorProfile();
  };

  const renderBasicInfo = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Basic Information</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>License Number *</Text>
        <TextInput
          style={styles.input}
          value={profile.licenseNumber}
          onChangeText={(value) => updateProfile('licenseNumber', value)}
          placeholder="Enter license number"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Years of Experience *</Text>
        <TextInput
          style={styles.input}
          value={profile.experience.toString()}
          onChangeText={(value) => updateProfile('experience', parseInt(value) || 0)}
          placeholder="Enter years of experience"
          keyboardType="numeric"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Hospital/Institution</Text>
        <TextInput
          style={styles.input}
          value={profile.hospital}
          onChangeText={(value) => updateProfile('hospital', value)}
          placeholder="Enter hospital name"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Clinic</Text>
        <TextInput
          style={styles.input}
          value={profile.clinic}
          onChangeText={(value) => updateProfile('clinic', value)}
          placeholder="Enter clinic name"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={profile.address}
          onChangeText={(value) => updateProfile('address', value)}
          placeholder="Enter full address"
          multiline
          numberOfLines={3}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={profile.bio}
          onChangeText={(value) => updateProfile('bio', value)}
          placeholder="Brief professional bio"
          multiline
          numberOfLines={4}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Languages</Text>
        {profile.languages.map((language, index) => (
          <View key={index} style={styles.arrayItemContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={language}
              onChangeText={(value) => updateNestedField('languages', index, '', value)}
              placeholder="Enter language"
              placeholderTextColor="#9CA3AF"
            />
            {profile.languages.length > 1 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeArrayItem('languages', index)}
              >
                <Ionicons name="remove-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => addArrayItem('languages', '')}
        >
          <Ionicons name="add-circle" size={20} color="#10B981" />
          <Text style={styles.addButtonText}>Add Language</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Profile Active</Text>
        <Switch
          value={profile.isActive}
          onValueChange={(value) => updateProfile('isActive', value)}
          trackColor={{ false: '#D1D5DB', true: '#10B981' }}
          thumbColor={profile.isActive ? '#FFFFFF' : '#FFFFFF'}
        />
      </View>
    </View>
  );

  const renderSpecializations = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Specializations</Text>
      
      {profile.specializations.map((spec, index) => (
        <View key={index} style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Specialization {index + 1}</Text>
            {profile.specializations.length > 1 && (
              <TouchableOpacity
                onPress={() => removeArrayItem('specializations', index)}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Specialization Name *</Text>
            <TextInput
              style={styles.input}
              value={spec.name}
              onChangeText={(value) => updateNestedField('specializations', index, 'name', value)}
              placeholder="e.g., Cardiology"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Certification</Text>
            <TextInput
              style={styles.input}
              value={spec.certification || ''}
              onChangeText={(value) => updateNestedField('specializations', index, 'certification', value)}
              placeholder="Enter certification"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Years of Experience *</Text>
            <TextInput
              style={styles.input}
              value={spec.yearsOfExperience.toString()}
              onChangeText={(value) => updateNestedField('specializations', index, 'yearsOfExperience', parseInt(value) || 0)}
              placeholder="Enter years"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addArrayItem('specializations', { name: '', certification: '', yearsOfExperience: 0 })}
      >
        <Ionicons name="add-circle" size={20} color="#10B981" />
        <Text style={styles.addButtonText}>Add Specialization</Text>
      </TouchableOpacity>
    </View>
  );

  const renderConsultationFees = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Consultation Fees</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Currency</Text>
        <TextInput
          style={styles.input}
          value={profile.consultationFees.currency}
          onChangeText={(value) => updateProfile('consultationFees', { ...profile.consultationFees, currency: value })}
          placeholder="USD"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>In-Person Consultation</Text>
        <TextInput
          style={styles.input}
          value={profile.consultationFees.inPerson.toString()}
          onChangeText={(value) => updateProfile('consultationFees', { ...profile.consultationFees, inPerson: parseFloat(value) || 0 })}
          placeholder="Enter fee"
          keyboardType="numeric"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Video Call Consultation</Text>
        <TextInput
          style={styles.input}
          value={profile.consultationFees.videoCall.toString()}
          onChangeText={(value) => updateProfile('consultationFees', { ...profile.consultationFees, videoCall: parseFloat(value) || 0 })}
          placeholder="Enter fee"
          keyboardType="numeric"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Call Consultation</Text>
        <TextInput
          style={styles.input}
          value={profile.consultationFees.phoneCall.toString()}
          onChangeText={(value) => updateProfile('consultationFees', { ...profile.consultationFees, phoneCall: parseFloat(value) || 0 })}
          placeholder="Enter fee"
          keyboardType="numeric"
          placeholderTextColor="#9CA3AF"
        />
      </View>
    </View>
  );

  const renderAvailability = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Weekly Availability</Text>
      
      {profile.availability.map((avail, index) => (
        <View key={index} style={styles.availabilityCard}>
          <View style={styles.availabilityHeader}>
            <Text style={styles.dayLabel}>{weekDays[avail.dayOfWeek]}</Text>
            <Switch
              value={avail.isAvailable}
              onValueChange={(value) => updateNestedField('availability', index, 'isAvailable', value)}
              trackColor={{ false: '#D1D5DB', true: '#10B981' }}
              thumbColor={avail.isAvailable ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
          
          {avail.isAvailable && (
            <View style={styles.timeContainer}>
              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>Start Time</Text>
                <TextInput
                  style={styles.input}
                  value={avail.startTime}
                  onChangeText={(value) => updateNestedField('availability', index, 'startTime', value)}
                  placeholder="09:00"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>End Time</Text>
                <TextInput
                  style={styles.input}
                  value={avail.endTime}
                  onChangeText={(value) => updateNestedField('availability', index, 'endTime', value)}
                  placeholder="17:00"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          )}
        </View>
      ))}
    </View>
  );

  const renderEducation = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Education</Text>
      
      {profile.education.map((edu, index) => (
        <View key={index} style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Education {index + 1}</Text>
            {profile.education.length > 1 && (
              <TouchableOpacity
                onPress={() => removeArrayItem('education', index)}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Degree *</Text>
            <TextInput
              style={styles.input}
              value={edu.degree}
              onChangeText={(value) => updateNestedField('education', index, 'degree', value)}
              placeholder="e.g., MD, MBBS"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Institution *</Text>
            <TextInput
              style={styles.input}
              value={edu.institution}
              onChangeText={(value) => updateNestedField('education', index, 'institution', value)}
              placeholder="Enter institution name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Year of Graduation *</Text>
            <TextInput
              style={styles.input}
              value={edu.year.toString()}
              onChangeText={(value) => updateNestedField('education', index, 'year', parseInt(value) || new Date().getFullYear())}
              placeholder="2020"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addArrayItem('education', { degree: '', institution: '', year: new Date().getFullYear() })}
      >
        <Ionicons name="add-circle" size={20} color="#10B981" />
        <Text style={styles.addButtonText}>Add Education</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCertifications = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Certifications</Text>
      
      {profile.certifications.map((cert, index) => (
        <View key={index} style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Certification {index + 1}</Text>
            {profile.certifications.length > 1 && (
              <TouchableOpacity
                onPress={() => removeArrayItem('certifications', index)}
              >
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Certification Name *</Text>
            <TextInput
              style={styles.input}
              value={cert.name}
              onChangeText={(value) => updateNestedField('certifications', index, 'name', value)}
              placeholder="Enter certification name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Institution *</Text>
            <TextInput
              style={styles.input}
              value={cert.institution}
              onChangeText={(value) => updateNestedField('certifications', index, 'institution', value)}
              placeholder="Enter institution name"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Year Obtained *</Text>
            <TextInput
              style={styles.input}
              value={cert.year.toString()}
              onChangeText={(value) => updateNestedField('certifications', index, 'year', parseInt(value) || new Date().getFullYear())}
              placeholder="2020"
              keyboardType="numeric"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Expiry Date (Optional)</Text>
            <TextInput
              style={styles.input}
              value={cert.expiryDate || ''}
              onChangeText={(value) => updateNestedField('certifications', index, 'expiryDate', value)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addArrayItem('certifications', { name: '', institution: '', year: new Date().getFullYear() })}
      >
        <Ionicons name="add-circle" size={20} color="#10B981" />
        <Text style={styles.addButtonText}>Add Certification</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 0: return renderBasicInfo();
      case 1: return renderSpecializations();
      case 2: return renderConsultationFees();
      case 3: return renderAvailability();
      case 4: return renderEducation();
      case 5: return renderCertifications();
      default: return renderBasicInfo();
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#2563EB', '#10B981']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Doctor Profile</Text>
        <Text style={styles.headerSubtitle}>Update your professional information</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      ) : (
        <>
          <View style={styles.tabContainer} >
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {sections.map((section, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.tab,
                    activeSection === index && styles.activeTab,
                  ]}
                  onPress={() => setActiveSection(index)}
                >
                  <Ionicons
                    name={section.icon as any}
                    size={20}
                    color={activeSection === index ? '#FFFFFF' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      activeSection === index && styles.activeTabText,
                    ]}
                  >
                    {section.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {renderSectionContent()}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.submitButton, saving && styles.submitButtonDisabled]} 
              onPress={handleSubmit}
              disabled={saving}
            >
              <LinearGradient
                colors={saving ? ['#9CA3AF', '#9CA3AF'] : ['#2563EB', '#10B981']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                {saving ? (
                  <>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.submitText}>Updating...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.submitText}>Update Profile</Text>
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    marginBottom: 70,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    opacity: 0.9,
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  activeTab: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  cardContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563EB',
  },
  arrayItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeButton: {
    marginLeft: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10B981',
    borderStyle: 'dashed',
    marginTop: 10,
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#10B981',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  availabilityCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  availabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  submitButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  submitText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
});

export default DoctorProfileForm;