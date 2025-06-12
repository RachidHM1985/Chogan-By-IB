import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Select,
  MenuItem,
  Pagination,
  Tooltip,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { supabase } from '../lib/supabaseClient';

const ReviewsSection = ({ tableName, productId, isInsertComment }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRating, setFilterRating] = useState(0);
  const [page, setPage] = useState(1);
  const [reviewsPerPage, setReviewsPerPage] = useState(3);
  const [showSuccessTooltip, setShowSuccessTooltip] = useState(false);
  const [reviewsUpdated, setReviewsUpdated] = useState(false);

  useEffect(() => {
    const fetchReviewsAndPerfume = async () => {
      setLoading(true);

      let query = supabase
        .from('avis')
        .select('*')
        .gte('rating', filterRating)
        .order('created_at', { ascending: false });

      if (isInsertComment) {
        query = query.eq('product_id', productId);
      }

      const { data: reviewsData, error: reviewsError } = await query;

      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
        setError('Erreur lors de la récupération des avis');
      } else {
        setReviews(reviewsData);
      }
      setLoading(false);
    };

    fetchReviewsAndPerfume();
  }, [productId, filterRating, reviewsUpdated, isInsertComment]);

  const updatePerfumeAverageRating = async () => {
    const { data: allReviews, error: reviewsError } = await supabase
      .from('avis')
      .select('rating')
      .eq('product_id', productId);

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
      return;
    }

    if (!allReviews.length) return; // éviter division par zéro

    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allReviews.length;

    const { error: updateError } = await supabase
      .from(tableName)
      .update({ note: averageRating })
      .eq('code_produit', productId);

    if (updateError) {
      console.error('Error updating perfume average rating:', updateError);
    }
  };

  const handlePostReview = async () => {
    if (rating === 0 || !reviewText || !userName) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    const { error } = await supabase
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
      setReviewsUpdated((prev) => !prev);
      setRating(0);
      setReviewText('');
      setUserName('');
      await updatePerfumeAverageRating();
      setShowSuccessTooltip(true);
      setTimeout(() => setShowSuccessTooltip(false), 3000);
    }
  };

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  // Pagination slice
  const currentReviews = reviews.slice((page - 1) * reviewsPerPage, page * reviewsPerPage);

  return (
    <Box
      sx={{
        marginTop: 4,
        backgroundColor: '#fefefe',
        padding: { xs: 1, sm: 4 }, // Réduction du padding sur mobile
        width: { xs: '100%', sm: '85%', md: '75%', lg: '60%' }, // 100% sur mobile
        maxWidth: '100%', // Ajout d'une largeur max
        marginLeft: 'auto',
        marginRight: 'auto',
        borderRadius: { xs: 0, sm: '12px' }, // Pas de border-radius sur mobile
        boxShadow: { xs: 'none', sm: '0 6px 18px rgba(0,0,0,0.1)' }, // Pas de shadow sur mobile
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        overflow: 'hidden', // Prévention des débordements
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: '900',
          textAlign: 'center',
          color: '#5d3a00',
          marginBottom: 3,
          textShadow: '1px 1px 4px rgba(93,58,0,0.3)',
          letterSpacing: { xs: 0.5, sm: 1.2 }, // Réduction de l'espacement sur mobile
          fontSize: { xs: '1.25rem', sm: '1.5rem' }, // Taille réduite sur mobile
        }}
      >
        Avis Clients
      </Typography>

      {loading ? (
        <Typography variant="body1" align="center" color="#7a7a7a">
          Chargement des avis...
        </Typography>
      ) : error ? (
        <Typography variant="body1" align="center" color="error">
          {error}
        </Typography>
      ) : (
        <>
          {/* Filtre par note */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 3,
              gap: { xs: 1, sm: 2 }, // Gap réduit sur mobile
              flexWrap: 'wrap',
              padding: { xs: '0 8px', sm: 0 }, // Padding horizontal sur mobile
            }}
          >
            <Typography
              variant="body1"
              sx={{ 
                alignSelf: 'center', 
                fontWeight: 600, 
                color: '#6b4c3b',
                fontSize: { xs: '0.875rem', sm: '1rem' }, // Taille réduite sur mobile
                textAlign: 'center',
                minWidth: 'fit-content',
              }}
            >
              Filtrer par note :
            </Typography>
            <Select
              value={filterRating}
              onChange={(e) => {
                setFilterRating(e.target.value);
                setPage(1);
              }}
              size="small"
              sx={{
                width: { xs: 120, sm: 140 }, // Largeur réduite sur mobile
                bgcolor: '#fff',
                borderRadius: 2,
                boxShadow: '0 0 8px rgba(107,76,59,0.1)',
                '& .MuiSelect-icon': {
                  color: '#6b4c3b',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  maxWidth: '100%',
                },
              }}
            >
              <MenuItem value={0}>Toutes</MenuItem>
              <MenuItem value={1}>1 étoile</MenuItem>
              <MenuItem value={2}>2 étoiles</MenuItem>
              <MenuItem value={3}>3 étoiles</MenuItem>
              <MenuItem value={4}>4 étoiles</MenuItem>
              <MenuItem value={5}>5 étoiles</MenuItem>
            </Select>
          </Box>

          {/* Reviews Grid */}
          <Grid
            container
            spacing={{ xs: 2, sm: 3 }} // Espacement réduit sur mobile
            sx={{
              margin: 0,
              width: '100%',
              '& .MuiGrid-item': {
                paddingLeft: { xs: 1, sm: 3 }, // Padding gauche réduit
                paddingTop: { xs: 1, sm: 3 }, // Padding haut réduit
              },
            }}
          >
            {currentReviews.length === 0 ? (
              <Grid item xs={12}>
                <Typography
                  variant="body1"
                  align="center"
                  sx={{ 
                    width: '100%', 
                    color: '#7a7a7a', 
                    fontStyle: 'italic',
                    padding: { xs: 2, sm: 0 },
                  }}
                >
                  Aucun avis pour ce produit.
                </Typography>
              </Grid>
            ) : (
              currentReviews.map((review) => (
                <Grid
                  item
                  key={review.id}
                  xs={12}
                  sm={6}
                  md={4}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: '#fff',
                      borderRadius: '15px',
                      padding: { xs: 2, sm: 3 }, // Padding réduit sur mobile
                      boxShadow:
                        '0 4px 15px rgba(107, 76, 59, 0.15), 0 1px 6px rgba(0, 0, 0, 0.05)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      cursor: 'default',
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      minHeight: { xs: 'auto', sm: '280px' }, // Hauteur flexible sur mobile
                      maxWidth: '100%',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: { xs: 'none', sm: 'scale(1.05)' }, // Pas d'effet hover sur mobile
                        boxShadow: {
                          xs: '0 4px 15px rgba(107, 76, 59, 0.15), 0 1px 6px rgba(0, 0, 0, 0.05)',
                          sm: '0 10px 25px rgba(107, 76, 59, 0.3), 0 4px 10px rgba(0, 0, 0, 0.1)',
                        },
                      },
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ 
                        fontWeight: 700, 
                        color: '#6b4c3b', 
                        mb: 0.5,
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                        wordBreak: 'break-word', // Gestion des mots longs
                      }}
                    >
                      {review.user_name}
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      sx={{ 
                        mb: 1, 
                        color: '#a67c52', 
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        wordBreak: 'break-word',
                      }}
                    >
                      Produit : {review.product_id}
                    </Typography>
                    <Rating
                      name="read-only"
                      value={review.rating}
                      readOnly
                      size={isMobile ? 'small' : 'medium'} // Taille réduite sur mobile
                      sx={{ mb: 1, color: '#d2b48c' }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ 
                        color: '#4e3b27', 
                        fontStyle: 'italic', 
                        flexGrow: 1,
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        hyphens: 'auto',
                      }}
                    >
                      « {review.review} »
                    </Typography>
                  </Box>
                </Grid>
              ))
            )}
          </Grid>

          {/* Pagination */}
          {reviews.length > reviewsPerPage && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: 4,
              px: { xs: 1, sm: 0 }, // Padding horizontal sur mobile
            }}>
              <Pagination
                count={Math.ceil(reviews.length / reviewsPerPage)}
                page={page}
                onChange={handleChangePage}
                color="primary"
                shape="rounded"
                size={isMobile ? 'small' : 'medium'} // Taille réduite sur mobile
                sx={{
                  '& .MuiPagination-ul': {
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                  },
                }}
              />
            </Box>
          )}

          {/* Formulaire d'ajout d'avis */}
          {isInsertComment && (
            <Box
              sx={{
                marginTop: 5,
                padding: { xs: 2, sm: 3 }, // Padding réduit sur mobile
                borderRadius: 3,
                bgcolor: '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                maxWidth: { xs: '100%', sm: 600 }, // Largeur complète sur mobile
                marginLeft: 'auto',
                marginRight: 'auto',
                mx: { xs: 1, sm: 'auto' }, // Marge horizontale sur mobile
              }}
            >
              <Typography
                variant="h6"
                sx={{ 
                  fontWeight: 'bold', 
                  color: '#5d3a00', 
                  mb: 2,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                }}
              >
                Laissez un avis
              </Typography>
              <Rating
                name="rating"
                value={rating}
                onChange={(event, newValue) => setRating(newValue)}
                size={isMobile ? 'medium' : 'large'} // Taille appropriée
                sx={{ mb: 3, color: '#d2b48c' }}
              />
              <TextField
                label="Nom"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                fullWidth
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    maxWidth: '100%',
                  },
                }}
                size={isMobile ? 'small' : 'medium'}
              />
              <TextField
                label="Votre avis"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                multiline
                rows={isMobile ? 3 : 4} // Moins de lignes sur mobile
                fullWidth
                sx={{ 
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    maxWidth: '100%',
                  },
                }}
                size={isMobile ? 'small' : 'medium'}
              />
              <Tooltip
                title="Avis posté avec succès !"
                open={showSuccessTooltip}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                arrow
              >
                <Button
                  variant="contained"
                  onClick={handlePostReview}
                  fullWidth={isMobile} // Bouton pleine largeur sur mobile
                  sx={{
                    bgcolor: '#a67c52',
                    color: '#fff',
                    fontWeight: 'bold',
                    minWidth: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                      bgcolor: '#6b4c3b',
                    },
                  }}
                >
                  Envoyer
                </Button>
              </Tooltip>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ReviewsSection;