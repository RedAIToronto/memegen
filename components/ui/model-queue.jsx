import { motion } from "framer-motion"

export function ModelQueue({ models }) {
  if (!models || models.length === 0) return null

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-2"
      >
        <span className="text-sm font-medium">Models in Training:</span>
        <div className="flex items-center gap-2">
          {models.map((model) => (
            <motion.div
              key={model.id || model._id} // Use either id or _id
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                {model.previewImage || model.image ? (
                  <img
                    src={model.previewImage || model.image}
                    alt={model.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/20" />
                )}
              </div>
              <span className="text-sm font-medium">{model.name}</span>
              <span className="text-xs text-muted-foreground">
                {model.estimatedTime}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
