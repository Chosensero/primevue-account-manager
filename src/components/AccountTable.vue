<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from 'vue'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import { type Account, type Label } from '@/stores/accounts'

const props = defineProps<{ accounts: Account[] }>()
const emit = defineEmits(['removeAccount', 'updateAccount'])

// Объект для отслеживания ошибок валидации для каждой учетной записи
const validationErrors = ref<Record<string, { login?: boolean; password?: boolean }>>({})

const validateAccount = (account: Account) => {
  const errors = {
    login: !account.login?.trim(),
    password: account.type !== 'LDAP' && !account.password?.trim(),
  }
  validationErrors.value[account.id] = errors
  return !errors.login && !errors.password
}

const handleUpdate = (account: Account) => {
  if (validateAccount(account)) {
    emit('updateAccount', account)
  }
}

// Отслеживание изменений в аккаунтах
watch(
  () => props.accounts,
  (newAccounts) => {
    newAccounts.forEach((account) => validateAccount(account))
  },
  { deep: true, immediate: true },
)
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full border-collapse border rounded-lg">
      <thead>
        <tr class="border">
          <th class="p-3">Метки</th>
          <th class="p-3">Тип записи</th>
          <th class="p-3">Логин</th>
          <th class="p-3">Пароль</th>
          <th class="p-3">Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="account in props.accounts" :key="account.id" class="border transition">
          <td class="p-2">
            <!-- Поле ввода меток, разделенных точкой с запятой -->
            <InputText
              v-model="account.labelsText"
              class="w-full"
              @blur="
                account.labels = (account.labelsText || '')
                  .split(';')
                  .map((text: string) => ({ text: text.trim() }))
                  .filter((label: Label) => label.text)
                handleUpdate(account)
              "
            />
          </td>
          <td class="p-2">
            <!-- Выпадающий список для выбора типа учетной записи -->
            <Dropdown
              v-model="account.type"
              :options="['Локальная', 'LDAP']"
              class="w-full"
              @change="handleUpdate(account)"
            />
          </td>
          <td class="p-2">
            <!-- Поле ввода логина -->
            <InputText
              v-model="account.login"
              class="w-full"
              :invalid="validationErrors[account.id]?.login"
              @blur="handleUpdate(account)"
            />
          </td>
          <td v-if="account.type !== 'LDAP'" class="p-2">
            <!-- Поле ввода пароля (не отображается для LDAP) -->
            <Password
              v-model="account.password"
              class="w-full"
              :invalid="validationErrors[account.id]?.password"
              @blur="handleUpdate(account)"
            />
          </td>
          <td class="p-2 text-center">
            <!-- Кнопка удаления аккаунта -->
            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              @click="emit('removeAccount', account.id)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
