// @vitest-environment jsdom
import axios, { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

import { voiceAgentService } from '@/services/voiceAgent.service';

import { voiceConversationSchema } from '@/lib/voiceApiContract';

import { ApiRequestError } from '@/utils/baseRequest';

import contract from './fixtures/voiceApiContract.json';

vi.mock('axios', async importOriginal => {
  const actual = await importOriginal<typeof import('axios')>();
  return { ...actual, default: Object.assign(vi.fn(), actual.default) };
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('localStorage', { getItem: () => null });
});
afterEach(() => vi.unstubAllGlobals());

describe('voice API wire contract (also asserted by Django HTTP tests)', () => {
  it.each(['statusReserved', 'statusCompleted', 'statusCancelled'] as const)(
    'consumes %s without renaming fields or dropping nulls',
    async key => {
      vi.mocked(axios).mockResolvedValue({ data: contract[key] });
      expect(await voiceAgentService.getSessionStatus(37, 'contract-session')).toEqual(
        contract[key]
      );
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          params: { conversation_id: 'contract-session' },
          timeout: 5000,
        })
      );
    }
  );

  it('reads nested transcript timestamps and list outcome metadata', async () => {
    vi.mocked(axios).mockResolvedValueOnce({ data: contract.detail });
    const detail = await voiceAgentService.getConversationById(91);
    expect(detail.transcript[0].timeInCallSecs).toBe(2.5);
    expect(detail.sessionActivity).toBe('conversation');
    vi.mocked(axios).mockResolvedValueOnce({ data: contract.list });
    expect(await voiceAgentService.getConversationsByAgent(37)).toEqual(contract.list);
  });

  it('sends camelCase cancellation JSON and validates the returned conversation', async () => {
    vi.mocked(axios).mockResolvedValue({ data: contract.detail });
    expect(
      await voiceAgentService.cancelConversation(37, 'contract-session', 'page_hidden_exit')
    ).toEqual(contract.detail);
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { conversationId: 'contract-session', endedReason: 'page_hidden_exit' },
      })
    );
  });

  it('accepts explicit null metadata and an empty transcript on an older record', () => {
    expect(
      voiceConversationSchema.parse({
        ...contract.detail,
        endedReason: null,
        sessionActivity: null,
        endedAt: null,
        durationSeconds: null,
        transcript: [],
      }).sessionActivity
    ).toBeNull();
  });

  it.each([
    { status: 'completed', ended_reason: 'manual_end' },
    { status: 'unexpected', endedReason: null },
    { status: null, endedReason: null },
  ])('rejects a malformed status payload: %j', async payload => {
    vi.mocked(axios).mockResolvedValue({ data: payload });
    await expect(voiceAgentService.getSessionStatus(37, 'contract-session')).rejects.toBeInstanceOf(
      ZodError
    );
  });

  it('preserves the server error code and HTTP status for startup decisions', async () => {
    const error = new AxiosError('Conflict');
    error.response = {
      status: 409,
      statusText: 'Conflict',
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: { error: 'A session is already active.', code: 'session_active' },
    };
    vi.mocked(axios).mockRejectedValue(error);
    await expect(voiceAgentService.getSignedUrl(37)).rejects.toMatchObject({
      name: ApiRequestError.name,
      status: 409,
      code: 'session_active',
    });
  });
});
