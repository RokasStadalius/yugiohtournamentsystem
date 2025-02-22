import styles from '../../../styles/CustomInput.module.css';

interface CustomInputProps {
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CustomInput({ type, placeholder, value, onChange }: CustomInputProps) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            className={styles.inputField}
            value={value}
            onChange={onChange}
        />
    );
}