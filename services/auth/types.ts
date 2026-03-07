export type TRegisterData = {
    email: string;
    password: string;
    role: TRole;
}

export enum TRole {
    CLIENT = "Client",
    WORKER = "Worker",
}