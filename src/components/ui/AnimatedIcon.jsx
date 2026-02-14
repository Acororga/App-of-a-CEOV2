import React from 'react';
import { motion } from 'framer-motion';

const AnimatedIcon = ({ icon: Icon, className, size = 24, ...props }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.2, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      className="inline-flex items-center justify-center"
    >
      <Icon className={className} size={size} {...props} />
    </motion.div>
  );
};

export default AnimatedIcon;
