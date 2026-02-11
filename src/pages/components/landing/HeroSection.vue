<script lang="ts" setup>
import { ref, onMounted } from 'vue'

interface Props {
  data: {
    title: string
    subtitle: string
    description: string
  }
}

defineProps<Props>()

const isVisible = ref(false)

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true
  }, 100)
})

function scrollToFeatures() {
  const element = document.querySelector('#features')
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}

function navigateToAuth() {
  window.location.href = '/auth'
}
</script>

<template>
  <section class="hero-section">
    <div class="hero-background">
      <div class="background-shape shape-1"></div>
      <div class="background-shape shape-2"></div>
      <div class="background-shape shape-3"></div>
    </div>

    <v-container class="hero-container">
      <v-row align="center" class="min-height-screen" justify="center">
        <v-col cols="12" lg="10" md="11">
          <div class="hero-content" :class="{ 'is-visible': isVisible }">
            <!-- Logo/Icon -->
            <div class="hero-icon">
              <v-icon 
                icon="mdi-bus-multiple" 
                size="80"
                color="primary"
              />
            </div>

            <!-- Main Title -->
            <h1 class="hero-title">
              {{ data.title }}
            </h1>

            <!-- Subtitle -->
            <h2 class="hero-subtitle">
              {{ data.subtitle }}
            </h2>

            <!-- Description -->
            <p class="hero-description">
              {{ data.description }}
            </p>

            <!-- CTA Buttons -->
            <div class="hero-actions">
              <v-btn
                class="cta-button primary-btn"
                color="primary"
                size="x-large"
                variant="elevated"
                @click="navigateToAuth"
              >
                <v-icon class="me-2" icon="mdi-login" />
                Get Started
              </v-btn>

              <v-btn
                class="cta-button secondary-btn"
                color="primary"
                size="x-large"
                variant="outlined"
                @click="scrollToFeatures"
              >
                <v-icon class="me-2" icon="mdi-arrow-down-circle" />
                Learn More
              </v-btn>
            </div>

            <!-- Trust Indicators -->
            <!-- <div class="trust-badges">
              <div class="badge">
                <v-icon icon="mdi-shield-check" size="24" color="success" />
                <span>Secure Payments</span>
              </div>
              <div class="badge">
                <v-icon icon="mdi-clock-fast" size="24" color="primary" />
                <span>Real-time Tracking</span>
              </div>
              <div class="badge">
                <v-icon icon="mdi-account-group" size="24" color="info" />
                <span>Trusted by Thousands</span>
              </div>
            </div> -->
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Scroll Indicator -->
    <!-- <div class="scroll-indicator">
      <div class="mouse">
        <div class="wheel"></div>
      </div>
      <p>Scroll Down</p>
    </div> -->
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #ffffff 0%, #f8f4ec 50%, #f0e8d8 100%);
  padding: 2rem 0;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.background-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.05;
  animation: float 20s infinite ease-in-out;
}

.shape-1 {
  width: 600px;
  height: 600px;
  background: #8B4513;
  top: -200px;
  right: -100px;
  animation-delay: 0s;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: #F4E4BC;
  bottom: -150px;
  left: -100px;
  animation-delay: 5s;
}

.shape-3 {
  width: 300px;
  height: 300px;
  background: #8B4513;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 10s;
}

.hero-container {
  position: relative;
  z-index: 1;
}

.min-height-screen {
  min-height: calc(100vh - 64px);
  padding: 3rem 0;
}

.hero-content {
  text-align: center;
  opacity: 0;
  transform: translateY(30px);
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-content.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.hero-icon {
  margin-bottom: 2rem;
  animation: bounceIn 1s ease-out 0.3s both;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  color: #2c1810;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  letter-spacing: -0.02em;
  animation: slideUp 0.8s ease-out 0.5s both;
}

.hero-subtitle {
  font-size: clamp(1.25rem, 3vw, 2rem);
  font-weight: 600;
  color: #8B4513;
  margin-bottom: 1.5rem;
  line-height: 1.4;
  animation: slideUp 0.8s ease-out 0.7s both;
}

.hero-description {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: #5a4a3a;
  max-width: 700px;
  margin: 0 auto 3rem;
  line-height: 1.7;
  animation: slideUp 0.8s ease-out 0.9s both;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
  margin-bottom: 3rem;
  animation: slideUp 0.8s ease-out 1.1s both;
}

.cta-button {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.2);
}

.primary-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139, 69, 19, 0.3);
}

.secondary-btn:hover {
  transform: translateY(-2px);
  background: rgba(139, 69, 19, 0.05);
}

.trust-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
  animation: slideUp 0.8s ease-out 1.3s both;
}

.badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.badge:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.badge span {
  font-size: 0.9rem;
  font-weight: 500;
  color: #2c1810;
}

/* .scroll-indicator {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  animation: fadeIn 1s ease-out 2s both;
} */

.mouse {
  width: 26px;
  height: 40px;
  border: 2px solid #8B4513;
  border-radius: 13px;
  margin: 0 auto 0.5rem;
  position: relative;
}

.wheel {
  width: 4px;
  height: 8px;
  background: #8B4513;
  border-radius: 2px;
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  animation: scroll 2s infinite;
}

/* .scroll-indicator p {
  font-size: 0.75rem;
  color: #8B4513;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
} */

/* Animations */
@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scroll {
  0% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(16px);
  }
}

/* Responsive */
@media (max-width: 960px) {
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .cta-button {
    width: 100%;
    max-width: 300px;
  }

  .trust-badges {
    gap: 1rem;
  }

  .badge {
    font-size: 0.85rem;
    padding: 0.6rem 1.2rem;
  }
}

@media (max-width: 600px) {
  .hero-icon {
    margin-bottom: 1.5rem;
  }

  .trust-badges {
    flex-direction: column;
    align-items: center;
  }

  .badge {
    width: 100%;
    max-width: 250px;
    justify-content: center;
  }
}
</style>