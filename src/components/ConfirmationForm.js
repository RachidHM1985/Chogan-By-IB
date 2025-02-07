import React, { useState, useMemo } from 'react';
import { useCart } from './CartProvider'; // Your cart context
import { Grid, TextField, Button, Typography, FormControl, InputLabel, Input, FormHelperText } from '@mui/material'; // Material-UI
import ConfirmationPopup from './ConfirmationPopup'; // Import the ConfirmationPopup component

const ConfirmationForm = () => {
  const { totalPrice, cartItems, clearCart } = useCart();

  const formFields = useMemo(() => [
    { name: 'name', label: 'Nom', type: 'text', required: true, validation: (value) => value.trim() !== '', errorMessage: 'Veuillez entrer votre nom.' },
    { name: 'prenom', label: 'Prénom', type: 'text', required: true, validation: (value) => value.trim() !== '', errorMessage: 'Veuillez entrer votre prénom.' },
    { name: 'phone', label: 'Téléphone', type: 'tel', required: true, validation: (value) => /^\+?[0-9]{1,15}$/.test(value), errorMessage: 'Numéro de téléphone invalide.' },
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

  // Handle input field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Restrict input to numbers only for phone number
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    setFormData((prevData) => ({
      ...prevData,
      phone: value,
    }));
  };

  // Handle form submission with validation
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

    // If there are no errors, proceed to show the confirmation popup
    if (Object.keys(errors).length === 0) {
      setFormSubmitted(true);
      clearCart(); // Clear cart after successful submission
    } else {
      setFormErrors(errors); // Set form errors if validation fails
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {formFields.map((field) => (
            <Grid item xs={12} sm={6} key={field.name}>
              <FormControl fullWidth error={Boolean(formErrors[field.name])} required={field.required}>
                <InputLabel htmlFor={field.name}>{field.label}</InputLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  value={formData[field.name] || ''}
                  onChange={field.name === 'phone' ? handlePhoneChange : handleInputChange} // Apply phone change handler
                  inputProps={{
                    inputMode: field.name === 'phone' ? 'numeric' : 'text', // Use numeric inputMode for phone field
                    pattern: '[0-9]*', // Restrict pattern for phone input
                  }}
                />
                <FormHelperText>{formErrors[field.name]}</FormHelperText>
              </FormControl>
            </Grid>
          ))}
        </Grid>

        <Grid container justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
          <Typography variant="h6">Total: {totalPrice}€</Typography>
          <Button type="submit" variant="contained" color="primary" disabled={formSubmitted}>
            {formSubmitted ? 'Commande confirmée' : 'Confirmer'}
          </Button>
        </Grid>
      </form>
    </div>
  );
};

export default ConfirmationForm;
