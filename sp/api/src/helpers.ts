import { randomUUID } from 'crypto';
export const generateRequestID = () => {
    return '_' + randomUUID()
}