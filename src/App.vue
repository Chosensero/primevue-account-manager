<script setup lang="ts">
import { computed } from 'vue'
import { useAccountStore, type Account, type Label } from '@/stores/accounts'
import { useThemeStore } from '@/stores/theme'
import Button from 'primevue/button'
import Message from 'primevue/message'
import AccountTable from '@/components/AccountTable.vue'

// Стор для работы с аккаунтами
const accountStore = useAccountStore()

// Стор для управления темой
const themeStore = useThemeStore()

// Преобразуем список аккаунтов, добавляя поле с текстовым представлением меток
const accounts = computed(() =>
  accountStore.accounts.map((account) => ({
    ...account,
    labelsText: account.labels.map((label) => label.text).join('; '),
  })),
)

// Флаг текущей темы
const isDarkMode = computed(() => themeStore.isDarkMode)

// Обновление аккаунта с разбором меток из строки в массив
const updateAccount = (updatedAccount: Account) => {
  updatedAccount.labels = (updatedAccount.labelsText || '')
    .split(';')
    .map((text: string) => ({ text: text.trim() }))
    .filter((label: Label) => label.text) // Исключаем пустые значения
  accountStore.updateAccount(updatedAccount)
}
</script>

<template>
  <!-- Кнопка переключения темы -->
  <div class="absolute top-2 right-2">
    <Button
      :icon="isDarkMode ? 'pi pi-moon' : 'pi pi-sun'"
      @click="themeStore.toggleDarkMode"
      text
    />
  </div>

  <div class="p-6 max-w-4xl mx-auto shadow-lg rounded-lg border border-gray-200">
    <!-- Информационное сообщение о формате ввода меток -->
    <Message class="mb-4 border-l-4 border-blue-500" icon="pi pi-info-circle">
      Для указания нескольких меток используйте `;` в качестве разделителя.
    </Message>

    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-semibold">Учетные записи</h2>
      <Button
        icon="pi pi-plus"
        label="Добавить"
        :outlined="isDarkMode"
        @click="accountStore.addAccount"
      />
    </div>

    <!-- Компонент таблицы с аккаунтами -->
    <AccountTable
      :accounts="accounts"
      @remove-account="accountStore.removeAccount"
      @update-account="updateAccount"
    />
  </div>
</template>
