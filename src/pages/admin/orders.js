import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { 
  Container, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, 
  Button, FormControl, Select, MenuItem, InputLabel, Grid, Typography, CircularProgress, 
  TextField, useMediaQuery, Snackbar 
} from '@mui/material'; 
import { Box } from '@mui/system';
import Link from 'next/link';
import AuthGuard from '../../components/AuthGuard';
import axios from 'axios';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const isMobile = useMediaQuery('(max-width: 768px)'); // Détecte si l'écran est mobile

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(
            'id, user_name, user_email, user_phone, user_address, total_amount, details, delivery_fee, order_status, created_at, updated_at'
          );
        if (error) throw error;
        setOrders(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des commandes', error);
        setError('Une erreur s\'est produite lors de la récupération des commandes.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const sendNewsletter = async () => {
    try {
      setLoadingUpdate(true);

      // Appel à l'API pour envoyer la newsletter à tous les prospects
      const response = await axios.post('/api/sendNewsLetterProspect');

      if (response.status === 200) {
        setSnackbarMessage('Newsletter envoyée avec succès à tous les prospects !');
        setSnackbarSeverity('success');
      } else {
        setSnackbarMessage('Erreur lors de l\'envoi de la newsletter.');
        setSnackbarSeverity('error');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la newsletter', error);
      setSnackbarMessage('Erreur lors de l\'envoi de la newsletter.');
      setSnackbarSeverity('error');
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleStatusChange = async (event, orderId) => {
    const newStatus = event.target.value;
    
    try {
      setLoadingUpdate(true);
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders((prevOrders) => 
        prevOrders.map((order) => 
          order.id === orderId ? { ...order, order_status: newStatus } : order
        )
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut', error);
      setError('Erreur lors de la mise à jour du statut de la commande');
    } finally {
      setLoadingUpdate(false);
    }
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setComment('');
  };

  const handleSendComment = () => {
    if (selectedOrder && comment.trim()) {
      sendEmail(selectedOrder, comment);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AuthGuard>
      <Container component="main" maxWidth="lg" sx={{ width: '100%' }}>
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h4" gutterBottom>Liste des commandes</Typography>
            </Grid>
            {error && (
              <Grid item xs={12}>
                <Typography color="error" variant="body1">{error}</Typography>
              </Grid>
            )}
            <Grid item xs={12}>
              <Button variant="contained" color="primary" component={Link} href="/">
                Retour à la page d'accueil
              </Button>
            </Grid>

            {selectedOrder && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Ajouter un commentaire pour la commande {selectedOrder.id} - {selectedOrder.user_name}
                </Typography>
                <TextField
                  label="Commentaire"
                  multiline
                  rows={4}
                  value={comment}
                  onChange={handleCommentChange}
                  variant="outlined"
                  fullWidth
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSendComment}
                  sx={{ mt: 2 }}
                  disabled={loadingUpdate}
                >
                  Envoyer l'email au client
                </Button>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="secondary"
                onClick={sendNewsletter}
                sx={{ mt: 2 }}
                disabled={loadingUpdate}
              >
                {loadingUpdate ? 'Envoi en cours...' : 'Envoyer la newsletter'}
              </Button>
            </Grid>

            <Grid item xs={12}>
              <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Numéro</TableCell>
                      <TableCell>Nom</TableCell>
                      {!isMobile && <TableCell>Email</TableCell>}
                      {!isMobile && <TableCell>Téléphone</TableCell>}
                      <TableCell>Adresse</TableCell>
                      <TableCell>Total (€)</TableCell>
                      {!isMobile && <TableCell>Détails</TableCell>}
                      <TableCell>Frais (€)</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Créé</TableCell>
                      {!isMobile && <TableCell>Mis à jour</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} onClick={() => handleRowClick(order)}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.user_name}</TableCell>
                        {!isMobile && <TableCell>{order.user_email}</TableCell>}
                        {!isMobile && <TableCell>{order.user_phone}</TableCell>}
                        <TableCell>{order.user_address}</TableCell>
                        <TableCell>{order.total_amount} €</TableCell>
                        {!isMobile && <TableCell>{order.details}</TableCell>}
                        <TableCell>{order.delivery_fee} €</TableCell>
                        <TableCell>
                          <FormControl sx={{ minWidth: 100 }} size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                              value={order.order_status}
                              onChange={(e) => handleStatusChange(e, order.id)}
                              disabled={loadingUpdate}
                            >
                              <MenuItem value="En attente">En attente</MenuItem>
                              <MenuItem value="Expédié">Expédié</MenuItem>
                              <MenuItem value="Livré">Livré</MenuItem>
                              <MenuItem value="Annulé">Annulé</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString('fr-FR')}</TableCell>
                        {!isMobile && <TableCell>{new Date(order.updated_at).toLocaleDateString('fr-FR')}</TableCell>}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Box>
      </Container>

      {/* Snackbar pour afficher le message de succès ou d'échec */}
      <Snackbar
        open={snackbarMessage !== ''}
        autoHideDuration={6000}
        onClose={() => setSnackbarMessage('')}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </AuthGuard>
  );
};

export default AdminOrders;
