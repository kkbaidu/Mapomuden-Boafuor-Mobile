import { MedicalRecord, useMedicalRecords } from '@/hooks/MedicalRecords';
import React, { createContext, ReactNode, useContext } from 'react';

interface MedicalRecordsType {
    fetchMedicalRecord: () => Promise<void>;
    updateMedicalRecord: (updateData: any) => Promise<void>;
    medicalRecord: MedicalRecord | null;
    setMedicalRecord: React.Dispatch<React.SetStateAction<MedicalRecord | null>>;
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    refreshing: boolean;
    setRefreshing: React.Dispatch<React.SetStateAction<boolean>>;
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
    modalVisible: boolean;
    setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
    modalType: string;
    setModalType: React.Dispatch<React.SetStateAction<string>>;
    formData: any;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    showDatePicker: boolean;
    setShowDatePicker: React.Dispatch<React.SetStateAction<boolean>>;
}

const MedicalRecordsContext = createContext<MedicalRecordsType | undefined>(undefined);

export const MedicalRecordsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const medicalRecord = useMedicalRecords();

    return (
        <MedicalRecordsContext.Provider value={medicalRecord}>
            {children}
        </MedicalRecordsContext.Provider>
    )
}

export const useMedicalRecordsContext = () => {
    const context = useContext(MedicalRecordsContext);
    if(context === undefined) {
        throw new Error('MedicalRecordsContext must be used within a MedicalRecordsProvider')
    }

    return context;
}