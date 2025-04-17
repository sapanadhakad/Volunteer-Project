// package com.volunteer.management.config; // Or your appropriate config package

// import io.swagger.v3.oas.models.OpenAPI;
// import io.swagger.v3.oas.models.info.Contact;
// import io.swagger.v3.oas.models.info.Info;
// import io.swagger.v3.oas.models.info.License;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;

// @Configuration
// public class OpenApiConfig {

//     @Bean
//     public OpenAPI customOpenAPI() {
//         // Define contact information
//         Contact contact = new Contact();
//         contact.setName("dev-team");
//         contact.setUrl("https://www.dev-team.com/"); // Use a valid URL schema
//         contact.setEmail("dev-team@gmail.com"); // Corrected email format
        

//         // Define license information
//         License license = new License()
//                 .name("Apache License Version 2.0")
//                 .url("https://www.apache.org/licenses/LICENSE-2.0"); // Removed extra quote


//         // Define API info
//         Info apiInfo = new Info()
//                 .title("Volunteer Management System API")
//                 .version("1.0") // Set your API version
//                 .description("API for managing volunteers and events")
//                 .contact(contact)
//                 .license(license);


//         // Create and return the OpenAPI definition
//         return new OpenAPI().info(apiInfo);

//         // For more advanced customization (servers, security, etc.),
//         // you can chain more methods on the OpenAPI object here.
//         // Example:
//         // .servers(List.of(new Server().url("http://localhost:8080").description("Local dev server")))
//         // .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
//         // .components(new Components().addSecuritySchemes("bearerAuth",
//         //     new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT")))
//     }
// }