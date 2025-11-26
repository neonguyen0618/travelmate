import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">
        Discover Your Next Adventure 🌍
      </h1>
      <p className="text-lg mb-6 opacity-80">
        Explore locations, plan trips, check weather, and save favorites.
      </p>

      <Link 
        to="/explore" 
        className="px-6 py-3 bg-accent text-white rounded shadow"
      >
        Start Exploring
      </Link>
    </section>
  );
}
