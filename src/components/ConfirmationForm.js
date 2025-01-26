import React, { useState, useMemo } from 'react';
import { useCart } from './CartProvider'; // Your cart context
import { Grid, TextField, Button, Typography } from '@mui/material'; // Material-UI
import ConfirmationPopup from './ConfirmationPopup'; // Import the ConfirmationPopup component

const ConfirmationForm = () => {
  const { totalPrice, cartItems, clearCart } = useCart();

  const formFields = useMemo(() => [
    { name: 'name', label: 'Nom', type: 'text', required: true, validation: (value) => value !== '', errorMessage: 'Veuillez entrer votre nom.' },
    { name: 'prenom', label: 'Prénom', type: 'text', required: true, validation: (value) => value !== '', errorMessage: 'Veuillez entrer votre prénom.' },
    { name: 'phone', label: 'Téléphone', type: 'tel', required: true, validation: (value) => /^\+?[0-9]\d{1,14}$/.test(value), errorMessage: 'Numéro de téléphone invalide.' },
    { name: 'email', label: 'Email', type: 'email', required: true, validation: (value) => /\S+@\S+\.\S+/.test(value), errorMessage: 'Email invalide.' },
  ], []);

  const [formData, setFormData] = useState({
    name: '',
    prenom: '',
    phone: '',
    email: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isPopupOpen, setPopupOpen] = useState(false); // State to open/close popup

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let errors = {};

    // Validation
    formFields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        errors[field.name] = field.errorMessage;
      } else if (field.validation && !field.validation(formData[field.name])) {
        errors[field.name] = field.errorMessage;
      }
    });

    if (Object.keys(errors).length === 0) {
      setFormSubmitted(true);
      setPopupOpen(true); // Open the confirmation popup
    } else {
      setFormErrors(errors);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {formFields.map((field) => (
            <Grid item xs={12} sm={6} key={field.name}>
              <TextField
                label={field.label}
                name={field.name}
                type={field.type}
                value={formData[field.name] || ''}
                onChange={handleInputChange}
                fullWidth
                required={field.required}
                error={Boolean(formErrors[field.name])}
                helperText={formErrors[field.name]}
              />
            </Grid>
          ))}
        </Grid>

        <Grid container justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
          <Typography variant="h6">Total: {totalPrice}€</Typography>
          <Button type="submit" variant="contained" color="primary" disabled={formSubmitted}>
            {formSubmitted ? 'Commande confirmée' : 'Confirmer la commande'}
          </Button>
        </Grid>
      </form>
    </div>
  );
};

export default ConfirmationForm;
