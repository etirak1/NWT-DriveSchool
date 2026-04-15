package com.autoskola.trainingservice.service;

import com.autoskola.trainingservice.dto.VehicleDTO;
import com.autoskola.trainingservice.model.Vehicle;
import com.autoskola.trainingservice.repository.VehicleRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final ModelMapper modelMapper;

    public VehicleService(VehicleRepository vehicleRepository, ModelMapper modelMapper) {
        this.vehicleRepository = vehicleRepository;
        this.modelMapper = modelMapper;
    }


    public VehicleDTO saveVehicle(VehicleDTO vehicleDTO) {
        Vehicle vehicle = modelMapper.map(vehicleDTO, Vehicle.class);
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return modelMapper.map(savedVehicle, VehicleDTO.class);
    }


    public List<VehicleDTO> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(v -> modelMapper.map(v, VehicleDTO.class))
                .collect(Collectors.toList());
    }


    public VehicleDTO getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vozilo nije pronađeno"));
        return modelMapper.map(vehicle, VehicleDTO.class);
    }
}