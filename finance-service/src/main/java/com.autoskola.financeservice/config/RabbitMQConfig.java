package com.autoskola.financeservice.config;
import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "skola_exchange";
    public static final String QUEUE_FINANCE = "finance_queue";
    public static final String QUEUE_TRAINING = "training_queue";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE);
    }

    @Bean
    public Queue financeQueue() {
        return new Queue(QUEUE_FINANCE);
    }

    @Bean
    public Queue trainingQueue() {
        return new Queue(QUEUE_TRAINING);
    }

    @Bean
    public Binding financeBinding(Queue financeQueue, TopicExchange exchange) {
        return BindingBuilder.bind(financeQueue).to(exchange).with("lesson.created");
    }

    @Bean
    public Binding trainingBinding(Queue trainingQueue, TopicExchange exchange) {
        return BindingBuilder.bind(trainingQueue).to(exchange).with("payment.*");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}