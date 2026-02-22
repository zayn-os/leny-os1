
import React, { useState, useEffect } from 'react';
import { Shield, FlaskConical, Coffee, Palette, Activity, Gift, ShoppingBag, Scroll } from 'lucide-react';

export const ItemIcon = ({ icon, size = 16 }: { icon: string; size?: number }) => {
  switch (icon) {
    case 'Shield': return <Shield size={size} />;
    case 'Flask': return <FlaskConical size={size} />;
    case 'Coffee': return <Coffee size={size} />;
    case 'Palette': return <Palette size={size} />;
    case 'Burger': return <Activity size={size} />;
    case 'Gift': return <Gift size={size} />;
    case 'Zap': return <Activity size={size} />;
    case 'Scroll': return <Scroll size={size} />; // 👈 NEW
    default: return <ShoppingBag size={size} />;
  }
};
