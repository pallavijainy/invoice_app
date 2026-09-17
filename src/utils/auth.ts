const saveToken = (token: string , rememberMe: boolean): void => {

    if (rememberMe) {
        sessionStorage.removeItem('authToken');
        localStorage.setItem('authToken', token);
    }
    else {
        localStorage.removeItem('authToken');
    sessionStorage.setItem('authToken', token);
    }
  };

const getToken = (): string | null => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
}

const removeToken = (): void => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
}   

export { saveToken, getToken, removeToken };