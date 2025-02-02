import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  isLoading: boolean;
}

export default function LoadingScreen({ isLoading }: LoadingScreenProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black text-white text-3xl font-bold z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: isLoading ? 0.1 : 0.25 }}
        >
          LOADING...
        </motion.div>
      )}
      {/* {!isLoading && (
        <motion.div
          className="bg-red-500 rounded px-4 py-2"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
        >
          <p className="text-white">Incorrect!</p>
        </motion.div>
      )} */}
    </AnimatePresence>
  );
}
