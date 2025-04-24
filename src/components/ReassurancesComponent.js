import React from 'react';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SavingsIcon from '@mui/icons-material/Savings';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';

export default function ReassurancesComponent() {
  const reassurances = [
    {
      icon: <CreditCardIcon sx={{ fontSize: 40 }} />,
      alt: "Paiement sécurisé",
      text: "Paiement<br>sécurisé",
      link: "/pages/conditions-generales-de-vente"
    },
    {
      icon: <LocalShippingIcon sx={{ fontSize: 40 }} />,
      alt: "Livraison offerte dès 80€ d'achat",
      text: "Livraison offerte<br>dès 80€ d'achat",
      link: "/pages/conditions-de-livraison"
    },
    {
      icon: <SavingsIcon sx={{ fontSize: 40 }} />,
      alt: "Faites des économies",
      text: "Faites des<br>économies",
      link: "/produits"
    },
    {
      icon: <CardGiftcardIcon sx={{ fontSize: 40 }} />,
      alt: "Récompenses fidélité",
      text: "Récompenses<br>fidélité",
      link: "/pages/programme-fidelite"
    }
  ];

  return (
    <section>
      <ul className="reassurances-container">
        {reassurances.map((item, index) => (
          <div key={index} style={{ paddingBottom: '10px' }}>
            <div 
              href={item.link}
              className="flex flex-col items-center text-center hover:opacity-80 transition-opacity"
              target="_blank"              
            >
              <div className="w-16 h-16 flex items-center justify-center text-[#72909F]">
                {item.icon}
              </div>
              <span 
                className="text-sm font-normal text-[#72909F] font-sans mt-2"
                dangerouslySetInnerHTML={{ __html: item.text }}
              />
            </div>
          </div>          
        ))}         
      </ul>     
    </section>
  );
}