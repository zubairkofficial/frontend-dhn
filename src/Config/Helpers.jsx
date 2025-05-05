import { Notyf } from "notyf";
import "notyf/notyf.min.css";

class Helpers {
  static localhost = "http://127.0.0.1:8000";
  static server = "https://dhnapi.cyberifyportfolio.com";
  static testServer = "https://dhntestapi.cyberifyportfolio.com";
  static basePath = `${this.localhost}`;
  static apiUrl = `${this.basePath}/api/`;

  static authUser = JSON.parse(localStorage.getItem("user") ?? "{}");

  static serverImage = (name) => {
    return `${this.basePath}/${name}`;
  };
  static getToken = () => {
    const token = localStorage.getItem("token");
    return token;
  };

  static authHeaders = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.getToken()}`,
    },
  };

  static authFileHeaders = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${this.getToken()}`,
    },
  };

  static getItem = (data, isJson = false) => {
    if (isJson) {
      return JSON.parse(localStorage.getItem(data));
    } else {
      return localStorage.getItem(data);
    }
  };

  static setItem = (key, data, isJson = false) => {
    if (isJson) {
      localStorage.setItem(key, JSON.stringify(data));
    } else {
      localStorage.setItem(key, data);
    }
  };

  static getTranslationValue = (key) => {
    const translations = this.getItem("translationData", true);
    const translation = translations?.find((item) => item.key === key);
    return translation ? translation.value : key;
  };

  static toast = (type, message) => {
    const notyf = new Notyf();
    notyf.open({
      message: message,
      type: type,
      position: { x: "right", y: "top" },
      ripple: true,
      dismissible: true,
      duration: 3000,
    });
  };

  static toggleCSS() {
    const path = window.location.pathname;

    const mainCSS = document.getElementsByClassName("main-theme");
    const dashboardCSS = document.getElementsByClassName("dashboard-theme");

    if (path.includes("/user") || path.includes("/admin")) {
      // Disable all main theme stylesheets
      for (let i = 0; i < mainCSS.length; i++) {
        mainCSS[i].setAttribute("disabled", "true");
      }
      // Enable all dashboard theme stylesheets
      for (let i = 0; i < dashboardCSS.length; i++) {
        dashboardCSS[i].removeAttribute("disabled");
      }
    } else {
      // Enable all main theme stylesheets
      for (let i = 0; i < mainCSS.length; i++) {
        mainCSS[i].removeAttribute("disabled");
      }
      // Disable all dashboard theme stylesheets
      for (let i = 0; i < dashboardCSS.length; i++) {
        dashboardCSS[i].setAttribute("disabled", "true");
      }
    }
  }

  static loadScript(scriptName, dashboard = false) {
    return new Promise((resolve, reject) => {
      const scriptPath = `/${
        dashboard ? "dashboard" : "assets/user"
      }/js/${scriptName}`;
      const script = document.createElement("script");
      script.src = scriptPath;
      script.async = true;

      script.onload = () => resolve(script);
      script.onerror = () =>
        reject(new Error(`Script load error: ${scriptPath}`));

      document.body.appendChild(script);
    });
  }

  static encryptObject = (obj) => {
    const str = JSON.stringify(obj);
    const encrypted = btoa(str);
    return encrypted;
  };

  static decryptObject = (str) => {
    const decrypted = atob(str);
    const obj = JSON.parse(decrypted);
    return obj;
  };

  static encryptString = (str) => {
    const encrypted = btoa(str);
    return encrypted;
  };

  static decryptString = (str) => {
    try {
      const decrypted = atob(str);
      return decrypted;
    } catch (error) {
      return "";
    }
  };

  static paginate = (data) => {
    let pageSize = 10;
    let paginated = [];
    let startIndex = 0;
    let totalPages = Math.ceil(data.length / pageSize);
    for (let i = 0; i < totalPages; i++) {
      let lastIndex = pageSize + startIndex;
      let pageData = data.slice(startIndex, lastIndex);
      paginated.push(pageData);
      startIndex += pageSize;
    }
    return paginated;
  };

  static getContentValue = (dataString) => {
    try {
      let data = JSON.parse(dataString);
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].delta.content;
      } else {
        return "";
      }
    } catch (error) {
      return "";
    }
  };

  static countWords = (str) => {
    if (str) {
      let words = str.split(" ");
      return words.length;
    } else {
      return 0;
    }
  };
}

export default Helpers;
