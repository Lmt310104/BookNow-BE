import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class GoshipSDKProvider {
  private readonly axiosInstance: AxiosInstance;
  private accessToken: string | null = null;
  constructor(private readonly config: ConfigService) {
    this.axiosInstance = axios.create({
      baseURL: 'https://sandbox.goship.io/api/v2',
      headers: { 'Content-Type': 'application/json' },
    });
    this.accessToken = config.get<string>('goship_accesstoken');
  }
  private async request<T = any>(
    method: 'get' | 'post',
    url: string,
    data?: any,
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.request<T>({
        method,
        url,
        data,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      console.log(`Goship ${method.toUpperCase()} ${url} failed`, error);
      throw error;
    }
  }
  async getCities() {
    return this.request('get', '/cities');
  }
}
