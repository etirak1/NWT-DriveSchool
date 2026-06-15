package com.autoskola.resourceservice.listener;

import com.autoskola.resourceservice.repository.InstructorRepository;
import com.autoskola.resourceservice.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class UserDeletedListener {

    private static final Logger log = LoggerFactory.getLogger(UserDeletedListener.class);

    private final InstructorRepository instructorRepository;
    private final UserRepository userRepository;

    public UserDeletedListener(InstructorRepository instructorRepository,
                               UserRepository userRepository) {
        this.instructorRepository = instructorRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    @RabbitListener(queues = "user_deleted_resource_queue")
    public void handleUserDeleted(Long userId) {
        try {
            instructorRepository.deleteByUserId(userId);
            userRepository.deleteById(userId);
            log.info("Instruktor i korisnik obrisani u resource-service za userId: {}", userId);
        } catch (Exception e) {
            log.error("Greška pri brisanju u resource-service za userId {}: {}", userId, e.getMessage());
        }
    }
}
