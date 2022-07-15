import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'MainLobby',
        component: () => import('pages/MainLobby.vue') },
      {
        path: 'coin-game',
        name: 'CoinGame',
        component: () => import('pages/CoinGame.vue') },
      {
        path: 'tictactoe-game',
        name: 'TicTacToeGame',
        component: () => import('pages/TicTacToeGame.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
