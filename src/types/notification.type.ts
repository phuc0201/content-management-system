export interface Notification extends Record<string, unknown> {
    id: number;
    type: string;
    name: string;
    phone: string;
    email: string;
    message: string;
}

export interface CreateNotificationDTO {
    type: string;
    name: string;
    phone: string;
    email: string;
    message: string;
}
