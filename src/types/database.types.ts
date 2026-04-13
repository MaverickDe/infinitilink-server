export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          firstname: string
          lastname: string
          password: string | null
          email_verified: boolean
          created_at: string
          updated_at: string
          google_id: string | null
          reset_password_token: string | null
          reset_password_expires: string | null
        }
        Insert: {
          id?: string
          email: string
          firstname: string
          lastname: string
          password?: string | null
          email_verified?: boolean
          created_at?: string
          updated_at?: string
          google_id?: string | null
          reset_password_token?: string | null
          reset_password_expires?: string | null
        }
        Update: {
          id?: string
          email?: string
          firstname?: string
          lastname?: string
          password?: string | null
          email_verified?: boolean
          created_at?: string
          updated_at?: string
          google_id?: string | null
          reset_password_token?: string | null
          reset_password_expires?: string | null
        }
      }
      otps: {
        Row: {
          id: string
          otp: string
          email: string
          type: string
          generated_count: number
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          otp: string
          email: string
          type: string
          generated_count?: number
          expires_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          otp?: string
          email?: string
          type?: string
          generated_count?: number
          expires_at?: string
          created_at?: string
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          sol_address: string
          sol_private_key: string
          naira_wallet: string | null
          usdc_wallet: string | null
          seed_phrase: string
          bridge_customer_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sol_address: string
          sol_private_key: string
          naira_wallet?: string | null
          usdc_wallet?: string | null
          seed_phrase: string
          bridge_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          sol_address?: string
          sol_private_key?: string
          naira_wallet?: string | null
          usdc_wallet?: string | null
          seed_phrase?: string
          bridge_customer_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bridge_accounts: {
        Row: {
          id: string
          user_id: string
          bridge_customer_id: string
          bridge_account_id: string | null
          customer_status: string
          account_status: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bridge_customer_id: string
          bridge_account_id?: string | null
          customer_status: string
          account_status?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bridge_customer_id?: string
          bridge_account_id?: string | null
          customer_status?: string
          account_status?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

