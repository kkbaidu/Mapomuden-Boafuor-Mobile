// app/(tabs)/profile/edit.tsx
import { useAuthContext } from '@/contexts/AuthContext';
import { User } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import React from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SelectList } from "react-native-dropdown-select-list";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Yup from 'yup';

const { width } = Dimensions.get('window');

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: '' | 'male' | 'female';
  location: string;
  bloodGroup: string;
  emergencyContact: {
    name: string;
    relationship?: string;
    phone: string;
  };
}

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  firstName: Yup.string()
    .trim()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters'),
  
  lastName: Yup.string()
    .trim()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters'),
  
  email: Yup.string()
    .trim()
    .required('Email is required')
    .email('Please enter a valid email address'),
  
  phone: Yup.string()
    .trim()
    .required('Phone number is required')
    .matches(/^[+]?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  
  gender: Yup.string()
    .required('Gender is required')
    .oneOf(['male', 'female'], 'Please select a valid gender'),
  
  location: Yup.string()
    .trim()
    .required('Location is required')
    .min(3, 'Location must be at least 3 characters'),
  
  bloodGroup: Yup.string()
    .required('Blood group is required')
    .oneOf(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], 'Please select a valid blood group'),
  
  emergencyContact: Yup.object().shape({
    name: Yup.string()
      .trim()
      .required('Emergency contact name is required')
      .min(2, 'Name must be at least 2 characters'),
    relationship: Yup.string()
      .trim(),
    phone: Yup.string()
      .trim()
      .required('Emergency contact phone is required')
      .matches(/^[+]?[\d\s\-\(\)]+$/, 'Please enter a valid phone number'),
  }),
});

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthContext();

  const bloodGroups = [
    { key: 'A+', value: 'A+' },
    { key: 'A-', value: 'A-' },
    { key: 'B+', value: 'B+' },
    { key: 'B-', value: 'B-' },
    { key: 'AB+', value: 'AB+' },
    { key: 'AB-', value: 'AB-' },
    { key: 'O+', value: 'O+' },
    { key: 'O-', value: 'O-' },
  ];

  const genderOptions = [
    { key: 'male', value: 'Male' },
    { key: 'female', value: 'Female' },
  ];

  const relationshipOptions = [
    { key: 'parent', value: 'Parent' },
    { key: 'spouse', value: 'Spouse' },
    { key: 'sibling', value: 'Sibling' },
    { key: 'child', value: 'Child' },
    { key: 'friend', value: 'Friend' },
    { key: 'relative', value: 'Relative' },
    { key: 'colleague', value: 'Colleague' },
    { key: 'other', value: 'Other' },
  ];

  // Initial form values
  const initialValues: ProfileForm = {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    gender: user?.gender || '',
    location: user?.location || '',
    bloodGroup: user?.bloodGroup || '',
    emergencyContact: {
      name: user?.emergencyContact?.name || '',
      relationship: user?.emergencyContact?.relationship || '',
      phone: user?.emergencyContact?.phone || '',
    },
  };

  const handleSubmit = async (values: ProfileForm, { setSubmitting }: any) => {
    try {
      const res = await updateUser(values as User);
      
      if (res.success) {
        Alert.alert(
          'Success',
          'Profile updated successfully',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', res.error || 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    onBlur,
    placeholder, 
    error,
    touched,
    keyboardType = 'default',
    multiline = false 
  }: any) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[
          styles.input, 
          error && touched && styles.inputError, 
          multiline && styles.textArea
        ]}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
      {error && touched && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          isSubmitting,
          isValid,
        }) => (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <LinearGradient
              colors={['#2563EB', '#10B981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.header}
            >
              <Text style={styles.headerTitle}>Edit Profile</Text>
              <Text style={styles.headerSubtitle}>Update your personal information</Text>
            </LinearGradient>

            {/* Form */}
            <View style={styles.formContainer}>
              <InputField
                label="First Name"
                value={values.firstName}
                onChangeText={handleChange('firstName')}
                onBlur={handleBlur('firstName')}
                placeholder="Enter your first name"
                error={errors.firstName}
                touched={touched.firstName}
              />

              <InputField
                label="Last Name"
                value={values.lastName}
                onChangeText={handleChange('lastName')}
                onBlur={handleBlur('lastName')}
                placeholder="Enter your last name"
                error={errors.lastName}
                touched={touched.lastName}
              />

              <InputField
                label="Email"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                placeholder="Enter your email address"
                keyboardType="email-address"
                error={errors.email}
                touched={touched.email}
              />

              <InputField
                label="Phone"
                value={values.phone}
                onChangeText={handleChange('phone')}
                onBlur={handleBlur('phone')}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                error={errors.phone}
                touched={touched.phone}
              />

              {/* Gender Selector */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Gender</Text>
                <View style={[
                  styles.pickerContainer, 
                  errors.gender && touched.gender && styles.inputError
                ]}>
                  <SelectList
                    setSelected={(val: string) => setFieldValue('gender', val)}
                    data={genderOptions}
                    save="key"
                    boxStyles={{ 
                      borderColor: errors.gender && touched.gender ? "#EF4444" : "#D1D5DB",
                      borderWidth: 0
                    }}
                    inputStyles={{ color: "black" }}
                    dropdownStyles={{ backgroundColor: "white" }}
                    dropdownTextStyles={{ color: "black" }}
                    search={false}
                    arrowicon={<Ionicons name="chevron-down-outline" size={24} color="#D1D5DB" />}
                    defaultOption={
                      values.gender
                        ? { key: values.gender, value: values.gender.charAt(0).toUpperCase() + values.gender.slice(1) }
                        : { key: '', value: 'Select Gender' }
                    }
                  />
                </View>
                {errors.gender && touched.gender && (
                  <Text style={styles.errorText}>{errors.gender}</Text>
                )}
              </View>

              {/* Blood Group Selector */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Blood Group</Text>
                <View style={[
                  styles.pickerContainer, 
                  errors.bloodGroup && touched.bloodGroup && styles.inputError
                ]}>
                  <SelectList
                    setSelected={(val: string) => setFieldValue('bloodGroup', val)}
                    data={bloodGroups}
                    save="key"
                    boxStyles={{ 
                      borderColor: errors.bloodGroup && touched.bloodGroup ? "#EF4444" : "#D1D5DB",
                      borderWidth: 0
                    }}
                    inputStyles={{ color: "black" }}
                    dropdownStyles={{ backgroundColor: "white" }}
                    dropdownTextStyles={{ color: "black" }}
                    search={false}
                    arrowicon={<Ionicons name="chevron-down-outline" size={24} color="#D1D5DB" />}
                    defaultOption={
                      values.bloodGroup
                        ? { key: values.bloodGroup, value: values.bloodGroup }
                        : { key: '', value: 'Select blood group' }
                    }
                  />
                </View>
                {errors.bloodGroup && touched.bloodGroup && (
                  <Text style={styles.errorText}>{errors.bloodGroup}</Text>
                )}
              </View>

              <InputField
                label="Location"
                value={values.location}
                onChangeText={handleChange('location')}
                onBlur={handleBlur('location')}
                placeholder="Enter your location"
                error={errors.location}
                touched={touched.location}
              />

              {/* Emergency Contact Section */}
              <View style={styles.sectionHeader}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#EF4444" />
                <Text style={styles.sectionTitle}>Emergency Contact</Text>
              </View>
              
              <InputField
                label="Emergency Contact Name"
                value={values.emergencyContact.name}
                onChangeText={handleChange('emergencyContact.name')}
                onBlur={handleBlur('emergencyContact.name')}
                placeholder="Enter emergency contact name"
                error={errors.emergencyContact?.name}
                touched={touched.emergencyContact?.name}
              />

              {/* Relationship Selector */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Relationship (Optional)</Text>
                <View style={[
                  styles.pickerContainer, 
                  errors.emergencyContact?.relationship && touched.emergencyContact?.relationship && styles.inputError
                ]}>
                  <SelectList
                    setSelected={(val: string) => setFieldValue('emergencyContact.relationship', val)}
                    data={relationshipOptions}
                    save="key"
                    boxStyles={{ 
                      borderColor: errors.emergencyContact?.relationship && touched.emergencyContact?.relationship ? "#EF4444" : "#D1D5DB",
                      borderWidth: 0
                    }}
                    inputStyles={{ color: "black" }}
                    dropdownStyles={{ backgroundColor: "white" }}
                    dropdownTextStyles={{ color: "black" }}
                    search={false}
                    arrowicon={<Ionicons name="chevron-down-outline" size={24} color="#D1D5DB" />}
                    defaultOption={
                      values.emergencyContact.relationship
                        ? { 
                            key: values.emergencyContact.relationship, 
                            value: relationshipOptions.find(r => r.key === values.emergencyContact.relationship)?.value || values.emergencyContact.relationship
                          }
                        : { key: '', value: 'Select Relationship' }
                    }
                  />
                </View>
                {errors.emergencyContact?.relationship && touched.emergencyContact?.relationship && (
                  <Text style={styles.errorText}>{errors.emergencyContact.relationship}</Text>
                )}
              </View>

              <InputField
                label="Emergency Contact Phone"
                value={values.emergencyContact.phone}
                onChangeText={handleChange('emergencyContact.phone')}
                onBlur={handleBlur('emergencyContact.phone')}
                placeholder="Enter emergency contact phone number"
                keyboardType="phone-pad"
                error={errors.emergencyContact?.phone}
                touched={touched.emergencyContact?.phone}
              />
            </View>

            {/* Save Button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.saveButton, 
                  (isSubmitting || !isValid) && styles.saveButtonDisabled
                ]}
                onPress={() => handleSubmit()}
                disabled={isSubmitting || !isValid}
              >
                <LinearGradient
                  colors={isSubmitting ? ['#9CA3AF', '#9CA3AF'] : ['#2563EB', '#10B981']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => router.back()}
                disabled={isSubmitting}
              >
                <Text style={[
                  styles.cancelButtonText,
                  isSubmitting && { opacity: 0.5 }
                ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </Formik>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  formContainer: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    color: '#1F2937',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  emergencyContactCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    borderStyle: 'dashed',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    marginTop: 32,
  },
  saveButton: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
});