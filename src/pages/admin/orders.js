// pages/admin/orders.js

import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import AuthGuard from '../../components/AuthGuard'; // Importer AuthGuard

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const OrdersAdminPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        let query = supabase.from('orders').select('*');

        if (selectedStatus !== 'all') {
          query = query.eq('order_status', selectedStatus);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setOrders(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [selectedStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ order_status: newStatus })
        .eq('id', orderId);

      if (error) {
        throw error;
      }

      setOrders(orders.map(order => (order.id === orderId ? { ...order, order_status: newStatus } : order)));
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <AuthGuard>
      <Container>
        <Typography variant="h4" gutterBottom>
          Gestion des Commandes
        </Typography>

        {error && <Typography color="error">{error}</Typography>}

        <Grid container spacing={3} justifyContent="space-between" alignItems="center">
          <Grid item>
            <FormControl>
              <InputLabel>Filtrer par statut</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="pending">En Attente</MenuItem>
                <MenuItem value="shipped">Expédiée</MenuItem>
                <MenuItem value="delivered">Livrée</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/admin/create-order')}
            >
              Ajouter une commande
            </Button>
          </Grid>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.user_name}</TableCell>
                    <TableCell>{order.user_email}</TableCell>
                    <TableCell>{order.total_amount}€</TableCell>
                    <TableCell>{order.order_status}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleStatusChange(order.id, 'shipped')}
                        disabled={order.order_status === 'shipped'}
                      >
                        Expédiée
                      </Button>
                      <Button
                        variant="outlined"
                        color="success"
                        onClick={() => handleStatusChange(order.id, 'delivered')}
                        disabled={order.order_status === 'delivered'}
                      >
                        Livrée
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </AuthGuard>
  );
};

export default OrdersAdminPage;
