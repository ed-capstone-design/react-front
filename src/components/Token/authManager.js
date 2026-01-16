import { tokenStorage } from "./tokenStorage";
import { jwtDecode } from "jwt-decode";

class AuthManager {
  constructor() {
    this.listeners = new Set();
    this.token = null;
    this.user = null;
    this.init();
  }

  init() {
    const token = tokenStorage.get();
    if (token) {
      this.token = token;
      this.user = this._decodeToken(token);
    }
  }
  login(token) {
    tokenStorage.set(token);
    this.token = token;
    this.user = this._decodeToken(token);
    this.notify();
  }
  logout() {
    tokenStorage.remove();
    this.token = null;
    this.user = null;
    this.notify();
  }

  getUser() {
    return this.user;
  }
  getToken() {
    return this.token;
  }
  onChange(callback) {
    this.listeners.add(callback);
    callback(this.token);
    //추후 구독 취소를 위한 함수 리턴
    return () => this.listeners.delete(callback);
  }

  notify() {
    this.listeners.forEach((callback) => callback(this.token));
  }
  _decodeToken(token) {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error(`토큰 오류 발생:${error.message}`);
      return null;
    }
  }
}
export const authManager = new AuthManager();
