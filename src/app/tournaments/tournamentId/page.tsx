'use client'

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import toast, {Toaster} from 'react-hot-toast';
import {Sidebar} from '../../components/sidebar';

export default function TournamentPage(){
    const router = useRouter();
    const [userId, setUserId] = useState('');
    
}