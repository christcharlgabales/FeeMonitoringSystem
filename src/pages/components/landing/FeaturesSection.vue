<script lang="ts" setup>
import { ref, onMounted } from 'vue'

interface Feature {
  title: string
  description: string
  icon: string
}

interface Props {
  features: Feature[]
}

defineProps<Props>()

const isVisible = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          isVisible.value = true
        }
      })
    },
    { threshold: 0.1 }
  )

  const section = document.querySelector('#features')
  if (section) {
    observer.observe(section)
  }
})
</script>

<template>
  <section id="features" class="features-section">
    <v-container>
      <div class="section-header" :class="{ 'is-visible': isVisible }">
        <div class="section-badge">
          <v-icon icon="mdi-star-four-points" size="20" color="primary" />
          <span>Features</span>
        </div>
        <h2 class="section-title">Everything You Need</h2>
        <p class="section-description">
          Comprehensive tools and features designed to make fee management seamless and efficient
        </p>
      </div>

      <div class="features-grid" :class="{ 'is-visible': isVisible }">
        <v-row>
          <v-col
            v-for="(feature, index) in features"
            :key="index"
            cols="12"
            sm="6"
            md="6"
            lg="3"
          >
            <div 
              class="feature-card"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="feature-card-inner">
                <div class="feature-icon-container">
                  <div class="icon-background"></div>
                  <v-icon
                    :icon="feature.icon"
                    size="40"
                    color="primary"
                    class="feature-icon"
                  />
                </div>

                <h3 class="feature-title">{{ feature.title }}</h3>
                <p class="feature-description">{{ feature.description }}</p>

                <div class="feature-arrow">
                  <v-icon icon="mdi-arrow-right" size="20" />
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-container>
  </section>
</template>

<style scoped>
.features-section {
  padding: 6rem 0;
  background: #ffffff;
  position: relative;
}

.features-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 50%, rgba(244, 228, 188, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(139, 69, 19, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
  z-index: 1;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.section-header.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(244, 228, 188, 0.3) 100%);
  border-radius: 50px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(139, 69, 19, 0.2);
}

.section-badge span {
  font-size: 0.875rem;
  font-weight: 700;
  color: #8B4513;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.section-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  color: #2c1810;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.section-description {
  font-size: clamp(1rem, 2vw, 1.125rem);
  color: #5a4a3a;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.7;
}

.features-grid {
  position: relative;
  z-index: 1;
}

.features-grid.is-visible .feature-card {
  animation: slideUpFade 0.6s ease-out forwards;
}

.feature-card {
  height: 100%;
  opacity: 0;
  transform: translateY(30px);
}

.feature-card-inner {
  height: 100%;
  padding: 2.5rem 2rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(139, 69, 19, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.feature-card-inner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #8B4513 0%, #D2691E 100%);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-card-inner:hover::before {
  transform: scaleX(1);
}

.feature-card-inner:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 40px rgba(139, 69, 19, 0.2);
  border-color: rgba(139, 69, 19, 0.3);
}

.feature-icon-container {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-background {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(244, 228, 188, 0.3) 100%);
  border-radius: 20px;
  transform: rotate(45deg);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-card-inner:hover .icon-background {
  transform: rotate(90deg) scale(1.1);
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.2) 0%, rgba(244, 228, 188, 0.4) 100%);
}

.feature-icon {
  position: relative;
  z-index: 1;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.feature-card-inner:hover .feature-icon {
  transform: scale(1.15) rotate(-5deg);
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c1810;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.feature-description {
  font-size: 0.9375rem;
  color: #5a4a3a;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.feature-arrow {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #8B4513;
}

.feature-card-inner:hover .feature-arrow {
  opacity: 1;
  transform: translateX(0);
}

@keyframes slideUpFade {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 960px) {
  .features-section {
    padding: 4rem 0;
  }

  .section-header {
    margin-bottom: 3rem;
  }

  .feature-card-inner {
    padding: 2rem 1.5rem;
  }
}

@media (max-width: 600px) {
  .features-section {
    padding: 3rem 0;
  }

  .feature-card {
    margin-bottom: 1.5rem;
  }

  .feature-card-inner {
    padding: 1.75rem 1.25rem;
  }
}
</style>