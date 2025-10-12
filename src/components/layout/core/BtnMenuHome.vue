<template>
  <v-btn width="90" height="60" :to="{ name: 'home' }" color="#1D62A1">
          <v-icon>mdi-home</v-icon>
        </v-btn>
</template>

<script>
export default {
data() {
    return {
        
    }
},
}
</script>

<style scoped lang="css">
button {
  background: #fff;
  border: none;
  position: relative;
  height: 60px;
  font-size: 1.6em;
  padding: 0 2em;
  cursor: pointer;
  transition: 800ms ease all;
  outline: none;
}

button:hover {
  background: #1D62A1;
  color: rgb(255, 255, 255);
  /* color text */
}

button:before,
button:after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  height: 3px;
  width: 0;
  background: #ffffff;
  /* barra */
  transition: 400ms ease all;
}

button:after {
  right: inherit;
  top: inherit;
  left: 0;
  bottom: 0;
}

button:hover:before,
button:hover:after {
  width: 100%;
  transition: 800ms ease all;
}

#logoasuss {
  width: 100%;
  text-align: center;
}
</style>