// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// /**
//  * Generic function to handle API requests.
//  * @param endpoint API endpoint (e.g., "lookFors").
//  * @param method HTTP method ("GET", "POST", etc.).
//  * @param body Optional request body.
//  * @returns Response data or error.
//  */
// export async function handleApiRequest<T>(endpoint: string, method: string, body?: any): Promise<T> {
//     try {
//         const options: RequestInit = {
//             method,
//             headers: { "Content-Type": "application/json" },
//             ...(body && { body: JSON.stringify(body) }),
//         };

//         const response = await fetch(`${BASE_URL}/api/${endpoint}`, options);

//         if (!response.ok) {
//             throw new Error(`Error: ${response.status} - ${response.statusText}`);
//         }

//         return await response.json();
//     } catch (error) {
//         console.error(`🚨 API Request Error [${method} ${endpoint}]:`, error);
//         throw error;
//     }
// }


// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// export async function handleApiRequest(endpoint: string, method: string, body?: any) {
    
//     console.log("🚀 ~ file: apiHandler.tsx ~ line 6 ~ handleApiRequest ~ endpoint", endpoint)
//     const options: RequestInit = {
//         method,
//         headers: { "Content-Type": "application/json" },
//         ...(body && { body: JSON.stringify(body) }),
//     };

//     const response = await fetch(`${BASE_URL}/${endpoint}`, options);

//     if (!response.ok) {
//         return new Response(`Error with ${method} on ${endpoint}`, { status: response.status });
//     }

//     const data = await response.json();
//     return new Response(JSON.stringify(data), {
//         status: 200,
//         headers: { "Content-Type": "application/json" }
//     });
// }