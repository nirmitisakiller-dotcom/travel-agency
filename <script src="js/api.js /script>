// ==========================================
// API Service
// ==========================================

window.API = {

    // Replace this later with your deployed backend URL
    BASE_URL: "https://YOUR_BACKEND_URL",

    async get(endpoint) {

        const response = await fetch(
            `${this.BASE_URL}${endpoint}`
        );

        if (!response.ok)
            throw new Error("API request failed");

        return response.json();

    },

    async post(endpoint, data = {}) {

        const response = await fetch(
            `${this.BASE_URL}${endpoint}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }
        );

        if (!response.ok)
            throw new Error("API request failed");

        return response.json();

    }

};
