import React, { useState, useEffect } from 'react';
import { Box, Typography, Rating, TextField, Button, Select, MenuItem, Pagination } from '@mui/material';
import { supabase } from '../supabaseClient';

const ReviewsSection = ({ productId, isInsertComment }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRating, setFilterRating] = useState(0); // For filter rating
  const [page, setPage] = useState(1); // Pagination state
  const [reviewsPerPage, setReviewsPerPage] = useState(3); // Number of reviews to display per page

  // Fetch reviews from Supabase when the component mounts or when filterRating or productId changes
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);

      // Créer la base de la requête
      let query = supabase
        .from('avis')
        .select('*')
        .gt('rating', filterRating)  // Filtrer par note
        .order('created_at', { ascending: false });  // Trier par date (le plus récent en premier)

      // Si isInsertComment est false, récupérez les avis de tous les produits
      if (!isInsertComment) {
        query = query;  // Pas de changement dans la requête
      } else {
        // Si isInsertComment est true, on filtre par produit
        query = query.eq('product_id', productId);  // Filtrer par product_id spécifique
      }

      // Exécution de la requête
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching reviews:', error);
        setError('Erreur lors de la récupération des avis');
      } else {
        setReviews(data);
      }

      setLoading(false);
    };

    fetchReviews();
  }, [productId, filterRating, isInsertComment]); // Re-fetch reviews when productId, filterRating, or isInsertComment changes

  const handlePostReview = async () => {
    if (rating === 0 || !reviewText || !userName) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    // Post the review to the database
    const { data, error } = await supabase
      .from('avis')
      .insert([
        {
          product_id: productId,
          rating: rating,
          review: reviewText,
          user_name: userName,
          created_at: new Date(),
        },
      ]);

    if (error) {
      console.error('Error posting review:', error);
      setError('Erreur lors de l\'envoi de votre avis.');
    } else {
      setError('');
      // Re-fetch reviews after posting a new one
      fetchReviews();
      setRating(0);
      setReviewText('');
      setUserName('');
    }
  };

  // Handle page change for pagination
  const handleChangePage = (event, value) => {
    setPage(value);
  };

  // Get the current reviews to display based on pagination
  const currentReviews = reviews.slice((page - 1) * reviewsPerPage, page * reviewsPerPage);

  return (
    <Box sx={{ marginTop: '10px', backgroundColor: '#f8f8f8', padding: '40px 20px' }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>
        Avis Clients
      </Typography>

      {loading ? (
        <Typography variant="body1" align="center">Chargement des avis...</Typography>
      ) : error ? (
        <Typography variant="body1" color="error" align="center">{error}</Typography>
      ) : (
        <Box>
          {/* Filter section */}
          <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <Typography variant="body1" sx={{ marginRight: '10px' }}>Filtrer par note :</Typography>
            <Select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              sx={{ width: '120px' }}
            >
              <MenuItem value={0}>Toutes</MenuItem>
              <MenuItem value={1}>1 étoile</MenuItem>
              <MenuItem value={2}>2 étoiles</MenuItem>
              <MenuItem value={3}>3 étoiles</MenuItem>
              <MenuItem value={4}>4 étoiles</MenuItem>
              <MenuItem value={5}>5 étoiles</MenuItem>
            </Select>
          </Box>

          {/* Display reviews */}
          {currentReviews.length === 0 ? (
            <Typography variant="body1" align="center">Aucun avis pour ce produit.</Typography>
          ) : (
            currentReviews.map((review) => (
              <Box key={review.id} sx={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{review.user_name}</Typography>
                <Rating name="read-only" value={review.rating} readOnly sx={{ marginBottom: '10px' }} />
                <Typography variant="body2" sx={{ color: '#555' }}>"{review.review}"</Typography>
              </Box>
            ))
          )}

          {/* Pagination */}
          {reviews.length > reviewsPerPage && (
            <Pagination
              count={Math.ceil(reviews.length / reviewsPerPage)}
              page={page}
              onChange={handleChangePage}
              sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
            />
          )}

          {/* Form for submitting a new review */}
          {isInsertComment && (
            <Box sx={{ marginTop: '30px' }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Laissez un avis</Typography>
              <Rating
                name="rating"
                value={rating}
                onChange={(event, newValue) => setRating(newValue)}
                sx={{ marginBottom: '20px' }}
              />
              <TextField
                label="Nom"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                fullWidth
                sx={{ marginBottom: '10px' }}
              />
              <TextField
                label="Votre avis"
                multiline
                rows={4}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                fullWidth
                sx={{ marginBottom: '20px' }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handlePostReview}
              >
                Poster l'avis
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ReviewsSection;
