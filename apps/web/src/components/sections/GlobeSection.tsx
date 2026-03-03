import { HolographicGlobe } from "@/components/3d/HolographicGlobe"
import { motion } from "framer-motion"

export function GlobeSection() {
    return (
        <section id="globe" className="py-20 relative overflow-hidden">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-12 text-center"
                >
                    <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple mb-4">
                        My Journey, Visualized
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Every pin represents a chapter in my story—from my first business to Department of Defense applications.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="w-full h-[600px]"
                >
                    <HolographicGlobe />
                </motion.div>

                {/* Tech callout badge */}
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center text-sm text-muted-foreground mt-4"
                >
                    🛠️ Built with Cesium.js — the same technology I used to build 3D asset tracking for the DoD.
                </motion.p>
            </div>
        </section>
    )
}
