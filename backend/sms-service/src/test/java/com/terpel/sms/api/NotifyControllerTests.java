package com.terpel.sms.api;

import com.terpel.sms.core.NotifyService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NotifyController.class)
class NotifyControllerTests {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private NotifyService notifyService;

  @Test
  void notifyTransferAceptadoReturnsOk() throws Exception {
    when(notifyService.sendPushTransfer(any())).thenReturn(true);
    String body = "{\"userId\":\"user-1\",\"amount\":1000,\"senderName\":\"Juan\",\"status\":\"Aceptado\"}";
    mockMvc.perform(
        post("/api/notify/transfer")
            .contentType(MediaType.APPLICATION_JSON)
            .content(body)
    ).andExpect(status().isOk());
  }

  @Test
  void notifyTransferRechazadoReturnsBadRequest() throws Exception {
    when(notifyService.sendPushTransfer(any())).thenReturn(false);
    String body = "{\"userId\":\"user-1\",\"amount\":1000,\"senderName\":\"Juan\",\"status\":\"Rechazado\"}";
    mockMvc.perform(
        post("/api/notify/transfer")
            .contentType(MediaType.APPLICATION_JSON)
            .content(body)
    ).andExpect(status().isBadRequest());
  }
}

