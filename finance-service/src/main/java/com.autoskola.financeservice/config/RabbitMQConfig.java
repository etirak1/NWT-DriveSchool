package com.autoskola.financeservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "skola_exchange";

    public static final String QUEUE_CANDIDATE = "finance_candidate_queue";
    public static final String QUEUE_LESSON    = "finance_lesson_queue";
    public static final String QUEUE_VEHICLE   = "finance_vehicle_queue";

    public static final String KEY_CANDIDATE = "candidate.created";
    public static final String KEY_LESSON    = "lesson.created";
    public static final String KEY_VEHICLE   = "vehicle.serviced";

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE, true, false);
    }

    @Bean public Queue candidateQueue() { return new Queue(QUEUE_CANDIDATE, true); }
    @Bean public Queue lessonQueue()    { return new Queue(QUEUE_LESSON,    true); }
    @Bean public Queue vehicleQueue()   { return new Queue(QUEUE_VEHICLE,   true); }

    @Bean
    public Binding candidateBinding(Queue candidateQueue, TopicExchange exchange) {
        return BindingBuilder.bind(candidateQueue).to(exchange).with(KEY_CANDIDATE);
    }

    @Bean
    public Binding lessonBinding(Queue lessonQueue, TopicExchange exchange) {
        return BindingBuilder.bind(lessonQueue).to(exchange).with(KEY_LESSON);
    }

    @Bean
    public Binding vehicleBinding(Queue vehicleQueue, TopicExchange exchange) {
        return BindingBuilder.bind(vehicleQueue).to(exchange).with(KEY_VEHICLE);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}