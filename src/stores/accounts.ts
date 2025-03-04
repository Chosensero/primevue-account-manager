import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface Label {
  text: string
}

export interface Account {
  id: number
  labels: Label[]
  type: 'Локальная' | 'LDAP'
  login: string
  password: string | null
  labelsText?: string
  errors?: {
    labels?: boolean
    login?: boolean
    password?: boolean
  }
}

const LOCAL_STORAGE_KEY = 'accounts'

// Создание Pinia-стора для управления аккаунтами
export const useAccountStore = defineStore('accounts', () => {
  const loadAccounts = (): Account[] => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!stored) return []

    try {
      const parsed = JSON.parse(stored) as unknown[]
      if (!Array.isArray(parsed)) return []

      return parsed.map((account): Account => {
        const acc = account as Partial<Account>
        return {
          id: typeof acc.id === 'number' ? acc.id : Date.now(),
          labels:
            typeof acc.labels === 'string'
              ? (acc.labels as string)
                  .split(';')
                  .map((text: string) => ({ text: text.trim() }))
                  .filter((label: Label) => label.text)
              : Array.isArray(acc.labels)
                ? acc.labels.map((label) => ({
                    text: typeof label.text === 'string' ? label.text.trim() : '',
                  }))
                : [],
          type: acc.type === 'Локальная' || acc.type === 'LDAP' ? acc.type : 'Локальная',
          login: typeof acc.login === 'string' ? acc.login : '',
          password: typeof acc.password === 'string' ? acc.password : null,
          labelsText: typeof acc.labelsText === 'string' ? acc.labelsText : undefined,
          errors: {},
        }
      })
    } catch {
      return []
    }
  }

  const accounts = ref<Account[]>(loadAccounts())

  // Добавляем новый аккаунт
  const addAccount = () => {
    accounts.value.push({
      id: Date.now(),
      labels: [],
      type: 'Локальная',
      login: '',
      password: '',
      labelsText: '',
      errors: {},
    })
    saveAccounts()
  }

  // Удаляем аккаунт
  const removeAccount = (id: number) => {
    accounts.value = accounts.value.filter((account) => account.id !== id)
    saveAccounts()
  }

  // Проверяем, все ли поля заполнены правильно
  const validateAccount = (account: Account) => {
    account.errors = {
      login: !account.login.trim() || account.login.length > 100,
      password:
        account.type === 'Локальная' &&
        (!account.password?.trim() || account.password.length > 100),
      labels: account.labels.some((label) => label.text.length > 50),
    }
    return !account.errors.login && !account.errors.password && !account.errors.labels
  }

  // Обновляем аккаунт
  const updateAccount = (updatedAccount: Account) => {
    const index = accounts.value.findIndex((acc) => acc.id === updatedAccount.id)
    if (index !== -1) {
      validateAccount(updatedAccount)
      accounts.value[index] = { ...updatedAccount }
      saveAccounts()
    }
  }

  // Сохраняем в localStorage
  const saveAccounts = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(accounts.value))
  }

  watch(accounts, saveAccounts, { deep: true })

  return { accounts, addAccount, removeAccount, validateAccount, updateAccount }
})
