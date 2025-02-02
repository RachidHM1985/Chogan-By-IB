import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient'; // Votre client Supabase
import { Container, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, Button, FormControl, Select, MenuItem, InputLabel, Grid, Typography, CircularProgress, TextField } from '@mui/material'; 
import { Box } from '@mui/system';
import Link from 'next/link';
import AuthGuard from '../../components/AuthGuard'; // AuthGuard pour vérifier l'accès
import axios from 'axios'; // Utilisation d'axios pour les requêtes API côté serveur (envoi email)

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [status, setStatus] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null); // Pour gérer la commande sélectionnée

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(
            'id, user_name, user_email, user_phone, user_address, total_amount, delivery_fee, order_status, created_at, updated_at'
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

  const sendEmail = async (order, comment) => {
    try {
      const response = await axios.post('/api/send-email', {
        order,
        comment
      });
      if (response.status === 200) {
        setSelectedOrder(false)
        console.log('Email envoyé avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email', error);
      setError('Erreur lors de l\'envoi de l\'email');
    }
  };

  const handleStatusChange = (event, orderId) => {
    setStatus(event.target.value);

    const updateOrderStatus = async () => {
      try {
        setLoadingUpdate(true);
        const { data, error } = await supabase
          .from('orders')
          .update({ order_status: event.target.value })
          .eq('id', orderId)
          .maybeSingle();

        if (error) throw error;
        
        setOrders((prevOrders) => 
          prevOrders.map((order) => 
            order.id === orderId ? { ...order, order_status: event.target.value } : order
          )
        );
      } catch (error) {
        console.error('Erreur lors de la mise à jour du statut', error);
        setError('Erreur lors de la mise à jour du statut de la commande');
      } finally {
        setLoadingUpdate(false);
      }
    };

    updateOrderStatus();
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const handleRowClick = (order) => {
    // Lorsqu'une ligne est cliquée, on sélectionne la commande et on affiche le champ de commentaire
    setSelectedOrder(order);
    setComment(''); // Réinitialiser le commentaire lorsqu'on clique sur une nouvelle commande
  };

  const handleSendComment = () => {
    if (selectedOrder && comment.trim()) {
      sendEmail(selectedOrder, comment); // Envoi de l'email avec le commentaire
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
      <Container component="main" maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h4" gutterBottom>Liste des commandes</Typography>
            </Grid>
            <Grid item xs={12}>
              {error && <Typography color="error" variant="body1">{error}</Typography>}
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" component={Link} href="/">
                Retour à la page d'accueil
              </Button>
            </Grid>
            {selectedOrder && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Ajouter un commentaire pour la commande {selectedOrder.id}- {selectedOrder.user_name}
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
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Numéro de commande</TableCell>
                      <TableCell>Nom utilisateur</TableCell>
                      <TableCell>Email utilisateur</TableCell>
                      <TableCell>Téléphone utilisateur</TableCell>
                      <TableCell>Adresse utilisateur</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Details Commande</TableCell>
                      <TableCell>Frais de livraison</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Créé le</TableCell>
                      <TableCell>Mis à jour le</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} onClick={() => handleRowClick(order)}>
                        <TableCell>{order.id}</TableCell>
                        <TableCell>{order.user_name}</TableCell>
                        <TableCell>{order.user_email}</TableCell>
                        <TableCell>{order.user_phone}</TableCell>
                        <TableCell>{order.user_address}</TableCell>
                        <TableCell>{order.total_amount} €</TableCell>
                        <TableCell>{order.detail_order} €</TableCell>
                        <TableCell>{order.delivery_fee} €</TableCell>
                        <TableCell>{order.order_status}</TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>{new Date(order.updated_at).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>
                          <FormControl sx={{ minWidth: 120 }} size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                              label="Status"
                              value={status || order.order_status}
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </AuthGuard>
  );
};

export default AdminOrders;
