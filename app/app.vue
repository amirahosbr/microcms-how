<template>
  <div>
    <Header />
    <NuxtPage :keepalive="{ max: 10 }" />
  </div>
</template>
