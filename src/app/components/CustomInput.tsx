import styles from '../../../styles/CustomInput.module.css';


interface CustomInputProps {
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

export function CustomInput({ 
    type, 
    placeholder, 
    value, 
    onChange, 
    className = '' 
}: CustomInputProps) {
    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`w-full px-4 py-3 rounded-lg border border-zinc-700 bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${className}`}
        />
    );
}