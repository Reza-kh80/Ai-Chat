'use client'

import Swal from 'sweetalert2'

const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timerProgressBar: true,
})

export const showToast = ({ type, message, timer = 3000 }) => {
    const theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'

    const toastConfig = {
        light: {
            success: {
                background: '#F0FDF4',
                color: '#166534',
                borderColor: '#BBF7D0'
            },
            error: {
                background: '#FEF2F2',
                color: '#991B1B',
                borderColor: '#FECACA',
            },
            warning: {
                background: '#FFFBEB',
                color: '#92400E',
                borderColor: '#FDE68A'
            },
            info: {
                background: '#EFF6FF',
                color: '#1E40AF',
                borderColor: '#BFDBFE'
            }
        },
        dark: {
            success: {
                background: '#064E3B',
                color: '#A7F3D0',
                borderColor: '#065F46'
            },
            error: {
                background: '#7F1D1D',
                color: '#FCA5A5',
                borderColor: '#991B1B'
            },
            warning: {
                background: '#78350F',
                color: '#FDE68A',
                borderColor: '#92400E'
            },
            info: {
                background: '#1E3A8A',
                color: '#BFDBFE',
                borderColor: '#1E40AF'
            }
        }
    }

    const styles = toastConfig[theme][type]

    Toast.fire({
        icon: type,
        title: message,
        timer,
        background: styles.background,
        color: styles.color,
        customClass: {
            popup: 'modern-toast-popup',
            title: 'modern-toast-title'
        },
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })
}