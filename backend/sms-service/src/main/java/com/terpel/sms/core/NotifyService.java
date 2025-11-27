package com.terpel.sms.core;

import com.terpel.sms.model.TransferNotifyRequest;
import org.springframework.stereotype.Service;

@Service
public class NotifyService {
  public boolean sendPushTransfer(TransferNotifyRequest req) {
    if (!"Aceptado".equals(req.getStatus())) {
      return false;
    }
    return true;
  }
}
