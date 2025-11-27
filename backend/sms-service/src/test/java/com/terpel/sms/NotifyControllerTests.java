package com.terpel.sms;

import com.terpel.sms.api.NotifyController;
import com.terpel.sms.core.NotifyService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = NotifyController.class)
public class NotifyControllerTests {

  @Autowired
  private MockMvc mockMvc;

  @MockBean
  private NotifyService notifyService;

  @Test
  void notifyTransferOkReturns200() throws Exception {
    Mockito.when(notifyService.sendPushTransfer(Mockito.any())).thenReturn(true);
    String json = "{\"userId\":\"u1\",\"amount\":20000,\"senderName\":\"Juan\",\"status\":\"Aceptado\"}";
    mockMvc.perform(post("/api/notify/transfer").contentType(MediaType.APPLICATION_JSON).content(json))
        .andExpect(status().isOk());
  }
}
