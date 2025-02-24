import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
} from "@mui/material";

const OrderConfirmationDialog = ({ 
  open, 
  handleClose, 
  handlePayment 
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    let errors = {};
    if (!formData.name.trim()) errors.name = "Le nom est requis.";
    if (!formData.email.includes("@")) errors.email = "Email invalide.";
    if (!formData.address.trim()) errors.address = "L'adresse est requise.";
    if (!/^\d{10}$/.test(formData.phone)) errors.phone = "Numéro invalide (10 chiffres requis).";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: "" });
  };

  const handleConfirm = () => {
    if (validateForm()) {
      handlePayment(formData);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Confirmation de Commande</DialogTitle>
      <DialogContent>
        <Typography variant="h6">Merci pour votre commande ! 🎉</Typography>
        <Typography variant="body1" sx={{ marginTop: 2 }}>
          Veuillez remplir vos informations pour confirmer votre commande :
        </Typography>
        <TextField
          fullWidth
          margin="normal"
          label="Nom"
          name="name"
          value={formData.name}
          onChange={handleFormChange}
          error={!!formErrors.name}
          helperText={formErrors.name}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleFormChange}
          error={!!formErrors.email}
          helperText={formErrors.email}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Adresse"
          name="address"
          value={formData.address}
          onChange={handleFormChange}
          error={!!formErrors.address}
          helperText={formErrors.address}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Téléphone"
          name="phone"
          value={formData.phone}
          onChange={handleFormChange}
          error={!!formErrors.phone}
          helperText={formErrors.phone}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">
          Fermer
        </Button>
        <Button onClick={handleConfirm} color="primary">
          Payer avec Stripe
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderConfirmationDialog;
