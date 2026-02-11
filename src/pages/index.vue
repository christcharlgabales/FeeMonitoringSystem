<script lang="ts" setup>
import { onMounted } from 'vue'
import { useLandingController } from '@/controller/landingController'
import OuterLayoutWrapper from '@/layouts/OuterLayoutWrapper.vue'
import HeroSection from '@/pages/components/landing/HeroSection.vue'
// import FeaturesSection from '@/pages/components/landing/FeaturesSection.vue'
// import StatsSection from '@/pages/components/landing/StatsSection.vue'
// import AboutSection from '@/pages/components/landing/AboutSection.vue'

const { data, loading, error, fetchLandingData } = useLandingController()

onMounted(async () => {
  await fetchLandingData()
})
</script>

<template>
  <OuterLayoutWrapper>
    <template #content>
      <div class="landing-view">
        <!-- Loading State -->
        <v-container
          v-if="loading"
          class="d-flex justify-center align-center loading-container"
        >
          <div class="loading-spinner">
            <v-progress-circular 
              color="primary" 
              indeterminate 
              size="64"
              width="6"
            />
            <p class="text-h6 mt-4 text-grey-darken-1">Loading...</p>
          </div>
        </v-container>

        <!-- Error State -->
        <v-container
          v-else-if="error"
          class="d-flex justify-center align-center error-container"
        >
          <v-alert
            color="error"
            icon="mdi-alert-circle"
            type="error"
            variant="tonal"
            class="error-alert"
          >
            <v-alert-title>Failed to load content</v-alert-title>
            {{ error }}
          </v-alert>
        </v-container>

        <!-- Main Content -->
        <div v-else-if="data" class="content-wrapper">
          <HeroSection :data="data" />
          <StatsSection />
          <FeaturesSection :features="data.features" />
          <AboutSection :data="data" />
        </div>
      </div>
    </template>
  </OuterLayoutWrapper>
</template>

<style scoped>
.landing-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
}

.loading-container,
.error-container {
  min-height: 70vh;
}

.loading-spinner {
  text-align: center;
  animation: fadeIn 0.5s ease-in;
}

.error-alert {
  max-width: 600px;
  animation: slideUp 0.5s ease-out;
}

.content-wrapper {
  animation: fadeIn 0.8s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>