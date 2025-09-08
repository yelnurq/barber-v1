import { useEffect, useState } from "react";
import axiosInstance from "../../api/axios";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const res = await axiosInstance.get("/reviews");
      setReviews(res.data);
    };
    fetchReviews();
  }, []);

  return (
    <section>
      <h2>Отзывы</h2>
      {reviews.map((r) => (
        <div key={r.id}>
          <strong>{r.client_name}</strong> ⭐ {r.rating}/5
          <p>{r.text}</p>
        </div>
      ))}
    </section>
  );
}
