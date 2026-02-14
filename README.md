# SaveSmart 🛍️💰

**SaveSmart** is a crowdsourced supermarket price comparison web application built to help Malaysians find the best deals on groceries. By leveraging community-contributed pricing data and real-time location services, SaveSmart empowers users to make informed decisions about where to shop.

![SaveSmart Screenshot](public/logo512.png)

## 🌟 Features

*   **🛒 Interactive Map Search:** Visualize nearby supermarkets, pasar malams, grocery stores, and food banks on an interactive map (powered by Leaflet).
*   **📍 Location-Based:** Automatically finds stores near you or lets you search by city.
*   **💰 Crowdsourced Pricing:** Users can submit current prices for items at specific locations to help the community.
*   **🧾 Receipt Verification:** Upload receipts as proof of purchase to validate submitted prices.
*   **📉 Price Comparison:** Color-coded indicators (Green/Yellow/Red) instantly show if an item is cheap, moderate, or expensive compared to the market average.
*   **🔐 Secure Authentication:** Sign up and log in using Email/Password or **Google Sign-In**.
*   **📱 Responsive Design:** Fully optimized for desktops, tablets, and mobile phones.

## 🛠️ Tech Stack

*   **Frontend:** [React.js](https://reactjs.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Backend / Database:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
*   **Maps:** [Leaflet](https://leafletjs.com/) & [OpenStreetMap](https://www.openstreetmap.org/)
*   **Icons:** [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

*   Node.js (v14 or higher)
*   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/savesmart.git
    cd savesmart/frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the `frontend` directory and add your keys:
    ```env
    REACT_APP_SUPABASE_URL=your_supabase_url
    REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
    REACT_APP_GOOGLE_PLACES_API_KEY=your_google_places_api_key (Optional)
    ```

4.  **Run the application:**
    ```bash
    npm start
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## 📦 Deployment to Vercel

1.  Push your code to a GitHub repository.
2.  Import the project into [Vercel](https://vercel.com/).
3.  Add the environment variables (`REACT_APP_SUPABASE_URL`, etc.) in the Vercel dashboard.
4.  Deploy!
5.  **Important:** Add your Vercel deployment URL to the "Redirect URIs" in both **Supabase Auth Settings** and **Google Cloud Console** (for Google Sign-In to work).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---
Built with ❤️ for the Krackathon.
